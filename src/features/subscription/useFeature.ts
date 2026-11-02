/** Per-feature access hook — wraps entitlements into a simple gate for any screen. */
import {useMemo} from 'react';
import {useEntitlements} from './subscription.service';
import type {AvailablePlan, EntitlementTrial, LockReason} from '../../shared/types';

interface FeatureGate {
  hasAccess: boolean;
  status: string;
  daysLeft: number | null;
  reason: LockReason | string | undefined;
  availableIn: AvailablePlan[] | undefined;
  isLoading: boolean;
}

const UNLOCKED_STATUSES = new Set(['FREE', 'TRIAL', 'ACTIVE', 'EXPIRING_SOON']);

export function useFeature(key: string): FeatureGate {
  const {data, isLoading} = useEntitlements();

  return useMemo(() => {
    if (!data) {
      return {hasAccess: false, status: '', daysLeft: null, reason: undefined, availableIn: undefined, isLoading};
    }
    const f = data.features.find(feat => feat.key === key);
    if (!f) {
      return {hasAccess: false, status: 'PAYMENT_REQUIRED', daysLeft: null, reason: 'NEVER_SUBSCRIBED', availableIn: undefined, isLoading};
    }
    return {
      hasAccess: f.hasAccess,
      status: f.status,
      daysLeft: f.daysLeft ?? null,
      reason: f.reason,
      availableIn: f.availableIn,
      isLoading,
    };
  }, [data, key, isLoading]);
}

export function useHasActiveSubscription(): boolean {
  const {data} = useEntitlements();
  return useMemo(
    () => data?.features.some(f => f.hasAccess && UNLOCKED_STATUSES.has(f.status)) ?? false,
    [data],
  );
}

export function useTrials(): EntitlementTrial[] {
  const {data} = useEntitlements();
  return useMemo(() => data?.trials ?? [], [data]);
}
