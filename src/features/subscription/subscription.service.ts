/**
 * Subscription plans + Razorpay payment — real backend (`/api/subscription/*`).
 *
 * Same routes for Admin / Teacher / Parent; the backend scopes everything to
 * the logged-in user (plans per role + school; admins also see the school's
 * subscriptions). The Razorpay public key comes back with each order —
 * nothing payment-related is configured in the app.
 */
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useCallback} from 'react';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';
import {QueryKeys} from '../../core/query/queryClient';
import type {
  Entitlements,
  MySubscriptionItem,
  Paginated,
  RazorpayOrder,
  RazorpayVerifyInput,
  Subscription,
  SubscriptionPlan,
  SubscriptionStatus,
} from '../../shared/types';

export interface MySubscriptionsParams {
  page: number;
  pageSize: number;
  status?: SubscriptionStatus;
}

export const subscriptionApi = {
  /** Already filtered by role/school and sorted (BASE first, then ADDON) — keep the order. */
  plans: async (): Promise<SubscriptionPlan[]> => {
    try {
      const {data} = await axiosClient.get<SubscriptionPlan[]>(Endpoints.subscription.plans);
      return data;
    } catch (e) {
      console.error('subscriptionApi.plans failed', e);
      rethrowApiError(e, 'Failed to load plans.');
    }
  },

  mySubscriptions: async (params: MySubscriptionsParams): Promise<Paginated<MySubscriptionItem>> => {
    try {
      const {data} = await axiosClient.get<Paginated<MySubscriptionItem>>(Endpoints.subscription.mySubscriptions, {
        params,
      });
      return data;
    } catch (e) {
      console.error('subscriptionApi.mySubscriptions failed', e);
      rethrowApiError(e, 'Failed to load your subscriptions.');
    }
  },

  entitlements: async (): Promise<Entitlements> => {
    try {
      const {data} = await axiosClient.get<Entitlements>(Endpoints.subscription.entitlements);
      return data;
    } catch (e) {
      console.error('subscriptionApi.entitlements failed', e);
      rethrowApiError(e, 'Failed to load entitlements.');
    }
  },

  /** Any older unpaid attempt for the same plan is cancelled by the backend. */
  subscribe: async (planPriceId: string): Promise<Subscription> => {
    try {
      const {data} = await axiosClient.post<Subscription>(Endpoints.subscription.subscribe, {planPriceId});
      return data;
    } catch (e) {
      console.error('subscriptionApi.subscribe failed', e);
      rethrowApiError(e, 'Failed to start the subscription.');
    }
  },

  /** Cancels an unpaid (PENDING_PAYMENT) subscription. */
  cancel: async (subscriptionId: string): Promise<Subscription> => {
    try {
      const {data} = await axiosClient.post<Subscription>(Endpoints.subscription.cancel(subscriptionId));
      return data;
    } catch (e) {
      console.error('subscriptionApi.cancel failed', e);
      rethrowApiError(e, 'Failed to cancel the subscription.');
    }
  },

  /** Idempotent — calling again for the same subscription returns the same order. */
  createRazorpayOrder: async (subscriptionId: string): Promise<RazorpayOrder> => {
    try {
      const {data} = await axiosClient.post<RazorpayOrder>(Endpoints.subscription.razorpayOrder(subscriptionId));
      return data;
    } catch (e) {
      console.error('subscriptionApi.createRazorpayOrder failed', e);
      rethrowApiError(e, 'Failed to start the payment.');
    }
  },

  /** Idempotent — safe to retry with the same payload. */
  verifyRazorpayPayment: async (subscriptionId: string, input: RazorpayVerifyInput): Promise<Subscription> => {
    try {
      const {data} = await axiosClient.post<Subscription>(
        Endpoints.subscription.razorpayVerify(subscriptionId),
        input,
      );
      return data;
    } catch (e) {
      console.error('subscriptionApi.verifyRazorpayPayment failed', e);
      rethrowApiError(e, 'Failed to verify the payment.');
    }
  },
};

export const useSubscriptionPlans = () =>
  useQuery({queryKey: QueryKeys.subscriptionPlans, queryFn: subscriptionApi.plans});

export const useMySubscriptions = (params: MySubscriptionsParams) =>
  useQuery({
    queryKey: [...QueryKeys.mySubscriptions, params],
    queryFn: () => subscriptionApi.mySubscriptions(params),
  });

/** Feature access for the logged-in user — refetched after every payment so locked features unlock. */
export const useEntitlements = () =>
  useQuery({queryKey: QueryKeys.entitlements, queryFn: subscriptionApi.entitlements});

/** Refetches plans + my-subscriptions + entitlements (e.g. right after a payment is verified). */
export function useRefreshSubscriptionData(): () => Promise<void> {
  const qc = useQueryClient();
  return useCallback(async () => {
    await Promise.all([
      qc.invalidateQueries({queryKey: QueryKeys.subscriptionPlans}),
      qc.invalidateQueries({queryKey: QueryKeys.mySubscriptions}),
      qc.invalidateQueries({queryKey: QueryKeys.entitlements}),
    ]);
  }, [qc]);
}

export const useCancelSubscription = () => {
  const refresh = useRefreshSubscriptionData();
  return useMutation({
    mutationFn: (subscriptionId: string) => subscriptionApi.cancel(subscriptionId),
    onSuccess: () => refresh(),
  });
};
