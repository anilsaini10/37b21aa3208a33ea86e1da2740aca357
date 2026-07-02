/** Pure formatting helpers — heavily unit-tested. */

/** Format a number as currency (default INR, no external Intl dependency). */
export function formatCurrency(amount: number, currency: 'INR' | 'USD' = 'INR'): string {
  const symbol = currency === 'INR' ? '₹' : '$';
  const rounded = Math.round(amount);
  // Indian grouping for INR (lakh/crore), western grouping otherwise.
  const grouped =
    currency === 'INR' ? groupIndian(Math.abs(rounded)) : groupWestern(Math.abs(rounded));
  return `${rounded < 0 ? '-' : ''}${symbol}${grouped}`;
}

function groupWestern(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function groupIndian(n: number): string {
  const s = n.toString();
  if (s.length <= 3) {
    return s;
  }
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3);
  return rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3;
}

/** Compact large numbers: 1234 -> "1.2K", 1500000 -> "1.5M". */
export function formatCompact(n: number): string {
  if (Math.abs(n) < 1000) {
    return String(n);
  }
  if (Math.abs(n) < 1_000_000) {
    return trimZero(n / 1000) + 'K';
  }
  return trimZero(n / 1_000_000) + 'M';
}

function trimZero(n: number): string {
  return n.toFixed(1).replace(/\.0$/, '');
}

export function formatPercentage(value: number, digits = 0): string {
  return `${value.toFixed(digits)}%`;
}

/** First-letter initials from a name (max 2). */
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(p => p.charAt(0).toUpperCase())
    .join('');
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** Format an ISO date string as "12 Jan 2026". Returns '' for invalid input. */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) {
    return '';
  }
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** Format an ISO date-time as "12 Jan, 09:30". */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) {
    return '';
  }
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${hh}:${mm}`;
}

/** Relative time such as "just now", "5m ago", "3d ago". */
export function timeAgo(iso: string, now: number = Date.now()): string {
  const then = new Date(iso).getTime();
  if (isNaN(then)) {
    return '';
  }
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) {
    return 'just now';
  }
  if (mins < 60) {
    return `${mins}m ago`;
  }
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
