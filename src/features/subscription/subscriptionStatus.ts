/** Subscription status → badge tone + label. One place for the plans, detail and history screens. */
import type {TranslationKey} from '../../core/i18n';
import type {BadgeTone} from '../../shared/components';
import type {FeatureRole, SubscriptionStatus} from '../../shared/types';

export const SUBSCRIPTION_STATUS_TONE: Record<SubscriptionStatus, BadgeTone> = {
  ACTIVE: 'success',
  EXPIRING_SOON: 'warning',
  UPCOMING: 'primary',
  PENDING_PAYMENT: 'info',
  PAYMENT_FAILED: 'error',
  EXPIRED: 'error',
  CANCELLED: 'neutral',
};

export const SUBSCRIPTION_STATUS_LABEL: Record<SubscriptionStatus, TranslationKey> = {
  ACTIVE: 'subscription_statusActive',
  EXPIRING_SOON: 'subscription_statusExpiringSoon',
  UPCOMING: 'subscription_statusUpcoming',
  PENDING_PAYMENT: 'subscription_statusPending',
  PAYMENT_FAILED: 'subscription_statusFailed',
  EXPIRED: 'subscription_statusExpired',
  CANCELLED: 'subscription_statusCancelled',
};

/** Order + labels for the admin's "Includes" grouping by role. */
export const FEATURE_ROLES: FeatureRole[] = ['ADMIN', 'TEACHER', 'PARENT'];

export const FEATURE_ROLE_LABEL: Record<FeatureRole, TranslationKey> = {
  ADMIN: 'adminProfile_admin',
  TEACHER: 'teacherProfile_teacher',
  PARENT: 'parentProfile_parent',
};

/** My-subscriptions filter tabs → `status` query param. */
export type SubscriptionFilter = 'ALL' | 'ACTIVE' | 'UPCOMING' | 'PENDING_PAYMENT' | 'EXPIRED';

export const FEATURE_STATUS_TONE: Record<string, BadgeTone> = {
  FREE: 'success',
  TRIAL: 'warning',
  ACTIVE: 'success',
  EXPIRING_SOON: 'warning',
  PAYMENT_REQUIRED: 'error',
};

export const LOCK_REASON_KEYS: Record<string, TranslationKey> = {
  NEVER_SUBSCRIBED: 'subscription_lockNeverSubscribed',
  PENDING_PAYMENT: 'subscription_lockPendingPayment',
  EXPIRED: 'subscription_lockExpired',
  TRIAL_ENDED: 'subscription_lockTrialEnded',
};
