/**
 * Decouples the axios error interceptor from the auth store — the interceptor
 * lives in `core/api`, while the store lives in `features/auth`, which itself
 * depends on `core/api` (via `authApi`). Importing the store directly here
 * would create a circular dependency, so `bootstrap.ts` registers a plain
 * callback instead.
 */
let unauthorizedHandler: (() => void) | null = null;

/** Called once at app bootstrap to wire up what happens on a 401. */
export function setUnauthorizedHandler(handler: () => void): void {
  unauthorizedHandler = handler;
}

/** Called by the response interceptor whenever any request comes back 401. */
export function notifyUnauthorized(): void {
  unauthorizedHandler?.();
}
