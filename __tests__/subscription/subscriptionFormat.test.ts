/** Unit tests for subscription format helpers. */
jest.mock('../../src/core/utils/format', () => ({
  formatCurrency: (v: number) => `₹${v}`,
}));

import {formatPaise, formatPerMonth} from '../../src/features/subscription/subscriptionFormat';
import type {PlanPrice} from '../../src/shared/types';

describe('formatPaise', () => {
  it('converts paise to rupees string', () => {
    expect(formatPaise(49900)).toBe('₹499');
    expect(formatPaise(100)).toBe('₹1');
    expect(formatPaise(0)).toBe('₹0');
  });
});

describe('formatPerMonth', () => {
  const makePrice = (overrides: Partial<PlanPrice>): PlanPrice => ({
    id: '1',
    label: 'Test',
    duration: '1 month',
    intervalUnit: 'MONTH',
    intervalCount: 1,
    amount: 49900,
    currency: 'INR',
    ...overrides,
  });

  it('returns null for a single month', () => {
    expect(formatPerMonth(makePrice({intervalUnit: 'MONTH', intervalCount: 1}))).toBeNull();
  });

  it('calculates per-month for multi-month price', () => {
    const price = makePrice({intervalUnit: 'MONTH', intervalCount: 6, amount: 60000});
    expect(formatPerMonth(price)).toBe('₹100');
  });

  it('calculates per-month for yearly price', () => {
    const price = makePrice({intervalUnit: 'YEAR', intervalCount: 1, amount: 120000});
    expect(formatPerMonth(price)).toBe('₹100');
  });

  it('returns null for unsupported interval unit', () => {
    const price = makePrice({intervalUnit: 'DAY', intervalCount: 30, amount: 30000});
    expect(formatPerMonth(price)).toBeNull();
  });
});
