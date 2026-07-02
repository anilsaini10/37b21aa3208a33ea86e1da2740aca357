/** Small general-purpose helpers. */

/** Promise-based delay used to simulate API latency in the mock layer. */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let idCounter = 0;

/** Generate a reasonably-unique id (prefix + time + counter). */
export function generateId(prefix = 'id'): string {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${idCounter.toString(36)}`;
}

/** Clamp a number into [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Group an array by a key selector. */
export function groupBy<T, K extends string | number>(
  items: T[],
  keyFn: (item: T) => K,
): Record<K, T[]> {
  return items.reduce((acc, item) => {
    const key = keyFn(item);
    (acc[key] ??= []).push(item);
    return acc;
  }, {} as Record<K, T[]>);
}

/** Sum a numeric field across an array. */
export function sumBy<T>(items: T[], valueFn: (item: T) => number): number {
  return items.reduce((total, item) => total + valueFn(item), 0);
}

/** Case-insensitive substring match across selected fields. */
export function matchesQuery<T>(item: T, query: string, fields: (keyof T)[]): boolean {
  if (!query.trim()) {
    return true;
  }
  const q = query.toLowerCase();
  return fields.some(f => String(item[f] ?? '').toLowerCase().includes(q));
}

/** Paginate an in-memory array (1-indexed pages). */
export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}
