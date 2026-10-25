/**
 * Pays for a subscription via Razorpay Checkout — shared by every subscription screen:
 *
 *   1. Subscription id:
 *        COMPLETE_PAYMENT with the SAME price → plan.mySubscription.id
 *        anything else                         → POST subscribe({planPriceId}) (backend
 *                                                cancels any older unpaid attempt)
 *        `payPending(id)`                      → that pending subscription (My subscriptions)
 *   2. POST razorpay-order → {keyId, orderId, amount, ...} (the app holds no key)
 *   3. RazorpayCheckout.open(...)
 *   4. POST razorpay-verify — ONLY a successful verify counts as paid; then plans /
 *      my-subscriptions / entitlements refetch so locked features unlock.
 *
 * `busyKey` is set from tap until the flow ends (a ref guards same-frame double
 * taps), so two checkouts can't start. The outcome lands in `result` for a ResultModal.
 */
import {useCallback, useRef, useState} from 'react';
import {Platform} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import {useTheme} from '../../core/theme';
import {useLanguage, type TranslationKey} from '../../core/i18n';
import {extractErrorCode, extractErrorStatus} from '../../core/api/apiError';
import {formatDate} from '../../core/utils/format';
import {subscriptionApi, useRefreshSubscriptionData} from './subscription.service';
import type {RazorpayVerifyInput, Subscription, SubscriptionPlan} from '../../shared/types';

export interface CheckoutResult {
  variant: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

type Translate = ReturnType<typeof useLanguage>['t'];

/** Backend `error.code` → friendly message. Anything else shows the backend's own message. */
const ERROR_CODE_KEYS: Record<string, TranslationKey> = {
  INVALID_PAYMENT_SIGNATURE: 'subscription_errSignature',
  SUBSCRIPTION_NOT_PENDING: 'subscription_errNotPending',
  AMOUNT_TOO_LOW: 'subscription_errAmountTooLow',
  PLAN_NOT_AVAILABLE: 'subscription_errPlanNotAvailable',
  ALREADY_COVERED_BY_SCHOOL: 'subscription_errCoveredBySchool',
  PAYMENT_GATEWAY_NOT_CONFIGURED: 'subscription_errGatewayDown',
  PAYMENT_GATEWAY_ERROR: 'subscription_errGatewayDown',
  PAYMENT_GATEWAY_AUTH_FAILED: 'subscription_errGatewayDown',
  FORBIDDEN: 'subscription_errNoSchool',
};

/** These mean the plans list is stale — refetch it. */
const REFETCH_ON_CODES = new Set(['SUBSCRIPTION_NOT_PENDING', 'PLAN_NOT_AVAILABLE']);

/** Friendly message for any subscription API error (also used by the screens' error states). */
export function subscriptionErrorMessage(e: unknown, t: Translate): string {
  const code = extractErrorCode(e);
  const key = code ? ERROR_CODE_KEYS[code] : undefined;
  if (key) {
    return t(key);
  }
  return e instanceof Error || (e && typeof e === 'object' && 'message' in e)
    ? String((e as {message: unknown}).message)
    : t('payment_failedMessage');
}

const VERIFY_RETRY_DELAYS_MS = [1000, 2000, 4000];

const sleep = (ms: number) => new Promise<void>(res => setTimeout(res, ms));

/** No response at all (status 0) or a 5xx — worth retrying an idempotent call. */
function isTransient(e: unknown): boolean {
  const status = extractErrorStatus(e);
  return status === 0 || (status !== undefined && status >= 500);
}

/** The SDK sometimes sends `description` as a JSON string (`{"error":{"description":..,"reason":..}}`). */
function parseSdkError(e: unknown): {code?: number; description?: string; reason?: string} {
  const err = (e ?? {}) as {code?: number; description?: unknown};
  let description = typeof err.description === 'string' ? err.description : undefined;
  let reason: string | undefined;
  if (description && description.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(description);
      const inner = parsed?.error ?? parsed;
      description = typeof inner?.description === 'string' ? inner.description : undefined;
      reason = typeof inner?.reason === 'string' ? inner.reason : undefined;
    } catch {
      // Not JSON after all — show as-is.
    }
  }
  return {code: err.code, description, reason};
}

/** Cancel code differs per platform: Android `Checkout.PAYMENT_CANCELED` = 0, iOS = 2 (on Android, 2 is a network error). */
function isCancelled(sdkError: {code?: number; reason?: string}): boolean {
  const cancelCode = Platform.OS === 'ios' ? 2 : 0;
  return sdkError.code === cancelCode || !!sdkError.reason?.toLowerCase().includes('cancel');
}

/** The plan's pending subscription is reused only when paying for the same price. */
export function pendingSubscriptionFor(plan: SubscriptionPlan, priceId: string): string | null {
  const sub = plan.mySubscription;
  return plan.action === 'COMPLETE_PAYMENT' && sub && sub.planPriceId === priceId ? sub.id : null;
}

export function useRazorpayCheckout() {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const refresh = useRefreshSubscriptionData();
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [result, setResult] = useState<CheckoutResult | null>(null);
  const inFlight = useRef(false);

  const failWithApiError = useCallback(
    (e: unknown) => {
      const code = extractErrorCode(e);
      if (code && REFETCH_ON_CODES.has(code)) {
        refresh();
      }
      setResult({variant: 'error', title: t('payment_failedTitle'), message: subscriptionErrorMessage(e, t)});
    },
    [refresh, t],
  );

  const verifyWithRetry = useCallback(async (subscriptionId: string, input: RazorpayVerifyInput) => {
    for (let attempt = 0; ; attempt++) {
      try {
        return await subscriptionApi.verifyRazorpayPayment(subscriptionId, input);
      } catch (e) {
        if (!isTransient(e) || attempt >= VERIFY_RETRY_DELAYS_MS.length) {
          throw e;
        }
        await sleep(VERIFY_RETRY_DELAYS_MS[attempt]);
      }
    }
  }, []);

  const successResult = useCallback(
    (planName: string, sub: Subscription): CheckoutResult => {
      const lines = [planName];
      if (sub.status === 'UPCOMING' && sub.startDate) {
        lines.push(t('subscription_renewalStarts', {date: formatDate(sub.startDate)}));
      }
      if (sub.endDate) {
        lines.push(t('subscription_validTillDate', {date: formatDate(sub.endDate)}));
      }
      return {variant: 'success', title: t('payment_successTitle'), message: lines.join('\n')};
    },
    [t],
  );

  /** Steps 2–4 for a known (or lazily created) subscription. */
  const run = useCallback(
    async (key: string, planName: string, getSubscriptionId: () => Promise<string>) => {
      if (inFlight.current) {
        return;
      }
      inFlight.current = true;
      setBusyKey(key);
      try {
        let subscriptionId: string;
        let order;
        try {
          subscriptionId = await getSubscriptionId();
          order = await subscriptionApi.createRazorpayOrder(subscriptionId);
        } catch (e) {
          failWithApiError(e);
          return;
        }

        let payment;
        try {
          payment = await RazorpayCheckout.open({
            key: order.keyId,
            order_id: order.orderId,
            amount: order.amount,
            currency: order.currency,
            name: 'Arise',
            description: order.description,
            prefill: {
              name: order.prefill?.name ?? '',
              email: order.prefill?.email ?? '',
              contact: order.prefill?.contact ?? '',
            },
            theme: {color: theme.colors.primary},
          });
        } catch (e) {
          const sdkError = parseSdkError(e);
          // The subscription stays PENDING_PAYMENT → the plan now offers "Complete payment".
          refresh();
          setResult(
            isCancelled(sdkError)
              ? {variant: 'info', title: t('subscription_cancelledTitle')}
              : {
                  variant: 'error',
                  title: t('payment_failedTitle'),
                  message: sdkError.description ?? t('payment_failedMessage'),
                },
          );
          return;
        }

        // The resolved promise alone is NOT proof of payment — verify first.
        let verified: Subscription;
        try {
          verified = await verifyWithRetry(subscriptionId, {
            razorpay_order_id: payment.razorpay_order_id ?? order.orderId,
            razorpay_payment_id: payment.razorpay_payment_id,
            razorpay_signature: payment.razorpay_signature ?? '',
          });
        } catch (e) {
          if (isTransient(e)) {
            refresh();
            setResult({
              variant: 'info',
              title: t('subscription_confirmingTitle'),
              message: t('subscription_confirmingMessage'),
            });
          } else {
            failWithApiError(e);
          }
          return;
        }

        await refresh();
        setResult(successResult(planName, verified));
      } finally {
        inFlight.current = false;
        setBusyKey(null);
      }
    },
    [failWithApiError, refresh, successResult, t, theme.colors.primary, verifyWithRetry],
  );

  /** Pay for `priceId` of `plan` — reuses the pending subscription only for the same price. */
  const payForPlan = useCallback(
    (plan: SubscriptionPlan, priceId: string) => {
      if (plan.action === 'NONE') {
        return Promise.resolve();
      }
      const pendingId = pendingSubscriptionFor(plan, priceId);
      return run(priceId, plan.name, async () => pendingId ?? (await subscriptionApi.subscribe(priceId)).id);
    },
    [run],
  );

  /** Pay an existing PENDING_PAYMENT subscription (My subscriptions → "Complete payment"). */
  const payPending = useCallback(
    (subscriptionId: string, planName: string) => run(subscriptionId, planName, async () => subscriptionId),
    [run],
  );

  return {
    payForPlan,
    payPending,
    busyKey,
    isBusy: busyKey !== null,
    result,
    clearResult: () => setResult(null),
  };
}
