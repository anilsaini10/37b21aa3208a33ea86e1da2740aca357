/** Subscription plans + Razorpay payment types — mirrors `/api/subscription/*`. */
import type {ID} from './common';

export type PlanScope = 'SELF' | 'SCHOOL';
export type PlanType = 'BASE' | 'ADDON';

/** What the plans screen should offer for a plan. `NONE` = nothing to pay (e.g. the school pays). */
export type PlanAction = 'SUBSCRIBE' | 'RENEW' | 'COMPLETE_PAYMENT' | 'NONE';

export type SubscriptionStatus =
  | 'PENDING_PAYMENT'
  | 'PAYMENT_FAILED'
  | 'UPCOMING'
  | 'ACTIVE'
  | 'EXPIRING_SOON'
  | 'EXPIRED'
  | 'CANCELLED';

/** Backend role names on plan features (uppercase). */
export type FeatureRole = 'ADMIN' | 'TEACHER' | 'PARENT';

export type TrialStatus = 'SCHEDULED' | 'ACTIVE' | 'ENDED';

export type FeatureStatusCode = 'FREE' | 'TRIAL' | 'ACTIVE' | 'EXPIRING_SOON' | 'PAYMENT_REQUIRED';

export type LockReason = 'NEVER_SUBSCRIBED' | 'PENDING_PAYMENT' | 'EXPIRED' | 'TRIAL_ENDED';

export interface PlanTrial {
  startDate: string;
  endDate: string;
  startsAt: string;
  endsAt: string;
  status: TrialStatus;
  daysLeft: number;
}

export interface EntitlementTrial {
  plan: {id: ID; code: string; name: string; scope: PlanScope; planType: PlanType};
  startsAt: string;
  endsAt: string;
  daysLeft: number;
}

export interface AvailablePlan {
  planId: ID;
  code: string;
  name: string;
  planType: PlanType;
  startingFrom: {amount: number; currency: string; duration: string} | null;
}

export interface PlanPrice {
  id: ID;
  label: string;
  duration: string;
  intervalUnit: string;
  intervalCount: number;
  /** In paise — use `formatPaise()`. */
  amount: number;
  currency: string;
}

export interface PlanFeature {
  featureId: ID;
  key: string;
  name: string;
  description?: string | null;
  isPaid: boolean;
  role: FeatureRole;
  /** null when the feature is for another role. */
  alreadyActive: boolean | null;
  activeVia: ('SELF' | 'SCHOOL' | 'TRIAL')[] | null;
}

export interface MySubscriptionSummary {
  id: ID;
  status: SubscriptionStatus;
  planPriceId: ID;
  startDate: string | null;
  endDate: string | null;
  daysLeft: number | null;
}

export interface SubscriptionPlan {
  id: ID;
  code: string;
  name: string;
  description?: string | null;
  scope: PlanScope;
  planType: PlanType;
  targetRoles: FeatureRole[];
  prices: PlanPrice[];
  startingFrom: {amount: number; currency: string; duration: string} | null;
  features: PlanFeature[];
  trial: PlanTrial | null;
  onTrial: boolean;
  coveredBySchool: boolean;
  canSubscribe: boolean;
  action: PlanAction;
  mySubscription: MySubscriptionSummary | null;
  upcomingRenewal: {id: ID; startDate: string; endDate: string} | null;
}

/** A subscription as returned by subscribe / verify / cancel. */
export interface Subscription {
  id: ID;
  status: SubscriptionStatus;
  planPriceId?: ID;
  startDate?: string | null;
  endDate?: string | null;
  [key: string]: unknown;
}

export interface SubscriptionPayment {
  id?: ID;
  amount: number;
  currency?: string;
  status: string;
  gatewayPaymentId: string | null;
  paidAt: string | null;
}

/** One row of GET /my-subscriptions (admins also get the school's subscriptions). */
export interface MySubscriptionItem {
  id: ID;
  status: SubscriptionStatus;
  plan: {id: ID; name: string; scope?: PlanScope; planType?: PlanType; [key: string]: unknown};
  price: {id?: ID; label?: string; amount: number; currency?: string; duration: string; [key: string]: unknown};
  startDate: string | null;
  endDate: string | null;
  daysLeft: number | null;
  payments: SubscriptionPayment[];
  [key: string]: unknown;
}

export interface EntitlementFeature {
  featureId?: ID;
  key: string;
  name: string;
  description?: string | null;
  status: FeatureStatusCode | string;
  hasAccess: boolean;
  expiresAt?: string | null;
  daysLeft?: number | null;
  sources?: string[];
  reason?: LockReason | string;
  availableIn?: AvailablePlan[];
  [key: string]: unknown;
}

export interface Entitlements {
  role: string;
  features: EntitlementFeature[];
  trials: EntitlementTrial[];
  subscriptions?: unknown[];
}

export interface RazorpayOrder {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  subscriptionId: ID;
  description: string;
  prefill: {name: string | null; email: string | null; contact: string | null};
}

export interface RazorpayVerifyInput {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
