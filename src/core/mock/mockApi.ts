/**
 * Mock API helpers — simulate network latency + pagination for dummy services.
 *
 * Feature services call `respond(data)` to mimic an async backend. When the app
 * is pointed at a real backend (`ENV.USE_MOCK_API = false`), feature services
 * swap these calls for `axiosClient` requests — the hook/query layer is unchanged.
 */
import {delay, matchesQuery, paginate} from '../utils/misc';
import type {Paginated, QueryParams} from '../../shared/types';

const LATENCY_MS = 350;

/** Resolve with data after a simulated latency. */
export async function respond<T>(data: T, ms: number = LATENCY_MS): Promise<T> {
  await delay(ms);
  return data;
}

/** Reject with an error after a simulated latency (for error-path testing). */
export async function fail(message: string, ms: number = LATENCY_MS): Promise<never> {
  await delay(ms);
  throw new Error(message);
}

/**
 * Filter → paginate an in-memory array the way a paginated endpoint would.
 */
export function paginateList<T>(
  items: T[],
  params: QueryParams | undefined,
  searchFields: (keyof T)[],
): Paginated<T> {
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 15;
  const search = params?.search ?? '';

  const filtered = search
    ? items.filter(item => matchesQuery(item, search, searchFields))
    : items;

  const total = filtered.length;
  return {
    items: paginate(filtered, page, pageSize),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
