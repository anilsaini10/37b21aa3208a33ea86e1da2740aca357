/**
 * Unit tests for useFeature, useHasActiveSubscription, useTrials hooks.
 * We mock React's useMemo to run synchronously (just calls the factory)
 * and mock useEntitlements to supply data, so we test the pure derivation.
 */

jest.mock('react', () => ({useMemo: (fn: () => unknown) => fn()}));

const mockUseEntitlements = jest.fn();
jest.mock('../../src/features/subscription/subscription.service', () => ({
  useEntitlements: () => mockUseEntitlements(),
}));

import {useFeature, useHasActiveSubscription, useTrials} from '../../src/features/subscription/useFeature';

afterEach(() => mockUseEntitlements.mockReset());

describe('useFeature', () => {
  it('returns loading state when data is not yet available', () => {
    mockUseEntitlements.mockReturnValue({data: undefined, isLoading: true});
    const result = useFeature('homework');
    expect(result.isLoading).toBe(true);
    expect(result.hasAccess).toBe(false);
    expect(result.status).toBe('');
  });

  it('returns PAYMENT_REQUIRED for an unknown feature key', () => {
    mockUseEntitlements.mockReturnValue({
      data: {role: 'TEACHER', features: [], trials: []},
      isLoading: false,
    });
    const result = useFeature('nonexistent');
    expect(result.hasAccess).toBe(false);
    expect(result.status).toBe('PAYMENT_REQUIRED');
    expect(result.reason).toBe('NEVER_SUBSCRIBED');
  });

  it('returns access true for FREE feature', () => {
    mockUseEntitlements.mockReturnValue({
      data: {
        role: 'TEACHER',
        features: [{key: 'homework', name: 'Homework', status: 'FREE', hasAccess: true}],
        trials: [],
      },
      isLoading: false,
    });
    const result = useFeature('homework');
    expect(result.hasAccess).toBe(true);
    expect(result.status).toBe('FREE');
  });

  it('returns trial info for TRIAL feature', () => {
    mockUseEntitlements.mockReturnValue({
      data: {
        role: 'TEACHER',
        features: [{key: 'exams', name: 'Exams', status: 'TRIAL', hasAccess: true, daysLeft: 5}],
        trials: [],
      },
      isLoading: false,
    });
    const result = useFeature('exams');
    expect(result.hasAccess).toBe(true);
    expect(result.status).toBe('TRIAL');
    expect(result.daysLeft).toBe(5);
  });

  it('returns lock info for PAYMENT_REQUIRED with reason', () => {
    const availablePlans = [{planId: '1', code: 'PRO', name: 'Pro', planType: 'BASE', startingFrom: null}];
    mockUseEntitlements.mockReturnValue({
      data: {
        role: 'TEACHER',
        features: [{
          key: 'exams', name: 'Exams', status: 'PAYMENT_REQUIRED', hasAccess: false,
          reason: 'TRIAL_ENDED', availableIn: availablePlans,
        }],
        trials: [],
      },
      isLoading: false,
    });
    const result = useFeature('exams');
    expect(result.hasAccess).toBe(false);
    expect(result.reason).toBe('TRIAL_ENDED');
    expect(result.availableIn).toEqual(availablePlans);
  });

  it('trusts backend hasAccess for unknown status', () => {
    mockUseEntitlements.mockReturnValue({
      data: {
        role: 'TEACHER',
        features: [{key: 'magic', name: 'Magic', status: 'FUTURE_STATUS', hasAccess: true}],
        trials: [],
      },
      isLoading: false,
    });
    const result = useFeature('magic');
    expect(result.hasAccess).toBe(true);
    expect(result.status).toBe('FUTURE_STATUS');
  });
});

describe('useHasActiveSubscription', () => {
  it('returns false when no features', () => {
    mockUseEntitlements.mockReturnValue({data: {role: 'TEACHER', features: [], trials: []}, isLoading: false});
    expect(useHasActiveSubscription()).toBe(false);
  });

  it('returns true when at least one ACTIVE feature with access', () => {
    mockUseEntitlements.mockReturnValue({
      data: {
        role: 'TEACHER',
        features: [{key: 'a', status: 'ACTIVE', hasAccess: true}],
        trials: [],
      },
      isLoading: false,
    });
    expect(useHasActiveSubscription()).toBe(true);
  });

  it('returns true for TRIAL status with access', () => {
    mockUseEntitlements.mockReturnValue({
      data: {
        role: 'TEACHER',
        features: [{key: 'a', status: 'TRIAL', hasAccess: true}],
        trials: [],
      },
      isLoading: false,
    });
    expect(useHasActiveSubscription()).toBe(true);
  });

  it('returns false when features exist but none have access', () => {
    mockUseEntitlements.mockReturnValue({
      data: {
        role: 'TEACHER',
        features: [{key: 'a', status: 'PAYMENT_REQUIRED', hasAccess: false}],
        trials: [],
      },
      isLoading: false,
    });
    expect(useHasActiveSubscription()).toBe(false);
  });

  it('returns false when data is not loaded', () => {
    mockUseEntitlements.mockReturnValue({data: undefined, isLoading: true});
    expect(useHasActiveSubscription()).toBe(false);
  });
});

describe('useTrials', () => {
  it('returns empty array when no data', () => {
    mockUseEntitlements.mockReturnValue({data: undefined, isLoading: true});
    expect(useTrials()).toEqual([]);
  });

  it('returns trials from entitlements', () => {
    const trials = [{plan: {id: '1', code: 'PRO', name: 'Pro', scope: 'SELF', planType: 'BASE'}, startsAt: '2025-01-01', endsAt: '2025-01-14', daysLeft: 7}];
    mockUseEntitlements.mockReturnValue({
      data: {role: 'TEACHER', features: [], trials},
      isLoading: false,
    });
    const result = useTrials();
    expect(result).toEqual(trials);
    expect(result[0].daysLeft).toBe(7);
  });
});
