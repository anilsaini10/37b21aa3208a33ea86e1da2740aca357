/** Money + duration helpers for subscription prices. All amounts from the backend are in paise. */
import {formatCurrency} from '../../core/utils/format';
import type {PlanPrice} from '../../shared/types';

/** 49900 → "₹499". */
export function formatPaise(amountPaise: number): string {
  return formatCurrency(amountPaise / 100);
}

/** Months a price covers, or null when it isn't a whole number of months (e.g. days). */
function monthsCovered(price: PlanPrice): number | null {
  const unit = price.intervalUnit?.toUpperCase();
  if (unit === 'MONTH') {
    return price.intervalCount;
  }
  if (unit === 'YEAR') {
    return price.intervalCount * 12;
  }
  return null;
}

/** "₹83/month" for durations longer than a month, else null. */
export function formatPerMonth(price: PlanPrice): string | null {
  const months = monthsCovered(price);
  if (!months || months <= 1) {
    return null;
  }
  return formatPaise(Math.round(price.amount / months));
}
