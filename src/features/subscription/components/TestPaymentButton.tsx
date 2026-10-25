/**
 * "Pay ₹1" test button on every role's Profile screen. Runs the real
 * subscription flow (subscribe → order → Checkout → verify) against the first
 * payable plan price of exactly ₹1 the backend offers this user — the app holds
 * no Razorpay key, so a test payment needs a ₹1 price set up on the backend.
 */
import React from 'react';
import {useLanguage} from '../../../core/i18n';
import {CustomButton, ResultModal} from '../../../shared/components';
import {useSubscriptionPlans} from '../subscription.service';
import {useRazorpayCheckout} from '../useRazorpayCheckout';
import type {PlanPrice, SubscriptionPlan} from '../../../shared/types';

const TEST_AMOUNT_PAISE = 100;

function findTestPrice(plans: SubscriptionPlan[] | undefined): {plan: SubscriptionPlan; price: PlanPrice} | null {
  for (const plan of plans ?? []) {
    if (plan.action === 'NONE') {
      continue;
    }
    const price = plan.prices.find(p => p.amount === TEST_AMOUNT_PAISE);
    if (price) {
      return {plan, price};
    }
  }
  return null;
}

export function TestPaymentButton(): React.JSX.Element {
  const {t} = useLanguage();
  const {refetch} = useSubscriptionPlans();
  const {payForPlan, isBusy, result, clearResult} = useRazorpayCheckout();
  const [noPlan, setNoPlan] = React.useState(false);
  const [loadingPlans, setLoadingPlans] = React.useState(false);

  const onPress = async () => {
    setLoadingPlans(true);
    const {data} = await refetch();
    setLoadingPlans(false);
    const target = findTestPrice(data);
    if (!target) {
      setNoPlan(true);
      return;
    }
    await payForPlan(target.plan, target.price.id);
  };

  return (
    <>
      <CustomButton
        title={`${t('payment_payButton')} ₹${TEST_AMOUNT_PAISE / 100}`}
        variant="outline"
        iconLeft="fee"
        loading={isBusy || loadingPlans}
        disabled={isBusy || loadingPlans}
        onPress={onPress}
      />
      <ResultModal
        visible={!!result || noPlan}
        variant={result?.variant ?? 'info'}
        title={result?.title ?? t('subscription_noTestPlanTitle')}
        message={result ? result.message : t('subscription_noTestPlanMessage')}
        onClose={() => {
          clearResult();
          setNoPlan(false);
        }}
      />
    </>
  );
}
