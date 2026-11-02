/** Unit tests for subscription status mappings. */
import {
  SUBSCRIPTION_STATUS_TONE,
  SUBSCRIPTION_STATUS_LABEL,
  FEATURE_STATUS_TONE,
  LOCK_REASON_KEYS,
} from '../../src/features/subscription/subscriptionStatus';

describe('SUBSCRIPTION_STATUS_TONE', () => {
  it('maps all subscription statuses to badge tones', () => {
    expect(SUBSCRIPTION_STATUS_TONE.ACTIVE).toBe('success');
    expect(SUBSCRIPTION_STATUS_TONE.EXPIRING_SOON).toBe('warning');
    expect(SUBSCRIPTION_STATUS_TONE.UPCOMING).toBe('primary');
    expect(SUBSCRIPTION_STATUS_TONE.PENDING_PAYMENT).toBe('info');
    expect(SUBSCRIPTION_STATUS_TONE.PAYMENT_FAILED).toBe('error');
    expect(SUBSCRIPTION_STATUS_TONE.EXPIRED).toBe('error');
    expect(SUBSCRIPTION_STATUS_TONE.CANCELLED).toBe('neutral');
  });
});

describe('SUBSCRIPTION_STATUS_LABEL', () => {
  it('maps all subscription statuses to translation keys', () => {
    expect(SUBSCRIPTION_STATUS_LABEL.ACTIVE).toMatch(/^subscription_/);
    expect(SUBSCRIPTION_STATUS_LABEL.EXPIRED).toMatch(/^subscription_/);
    expect(SUBSCRIPTION_STATUS_LABEL.CANCELLED).toMatch(/^subscription_/);
  });
});

describe('FEATURE_STATUS_TONE', () => {
  it('maps feature statuses to badge tones', () => {
    expect(FEATURE_STATUS_TONE.FREE).toBe('success');
    expect(FEATURE_STATUS_TONE.TRIAL).toBe('warning');
    expect(FEATURE_STATUS_TONE.ACTIVE).toBe('success');
    expect(FEATURE_STATUS_TONE.EXPIRING_SOON).toBe('warning');
    expect(FEATURE_STATUS_TONE.PAYMENT_REQUIRED).toBe('error');
  });
});

describe('LOCK_REASON_KEYS', () => {
  it('maps lock reasons to translation keys', () => {
    expect(LOCK_REASON_KEYS.NEVER_SUBSCRIBED).toMatch(/^subscription_lock/);
    expect(LOCK_REASON_KEYS.PENDING_PAYMENT).toMatch(/^subscription_lock/);
    expect(LOCK_REASON_KEYS.EXPIRED).toMatch(/^subscription_lock/);
    expect(LOCK_REASON_KEYS.TRIAL_ENDED).toMatch(/^subscription_lock/);
  });
});
