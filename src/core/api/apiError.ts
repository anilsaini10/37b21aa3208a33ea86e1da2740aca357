/**
 * Shared error normalisation for real-backend service calls.
 *
 * The axios error interceptor (`transform.interceptor.ts`) rejects with a
 * plain `{status, message, code}` object. Every service that hits the real
 * backend wraps its axios calls in try/catch and rethrows via `apiError()` so
 * callers always get a proper `Error` (with `.code` attached for branching on
 * specific backend error codes like `EMAIL_TAKEN`).
 */

/** Normalises whatever the axios error interceptor (or a network failure) throws into a message string. */
export function extractErrorMessage(e: unknown, fallback: string): string {
  if (e && typeof e === 'object' && 'message' in e && typeof (e as {message?: unknown}).message === 'string') {
    return (e as {message: string}).message;
  }
  return fallback;
}

/** Pulls the backend's error `code` (e.g. `EMAIL_TAKEN`, `VALIDATION_ERROR`) off a caught error, if present. */
export function extractErrorCode(e: unknown): string | undefined {
  if (e && typeof e === 'object' && 'code' in e && typeof (e as {code?: unknown}).code === 'string') {
    return (e as {code: string}).code;
  }
  return undefined;
}

/** Attaches the backend's error `code` to a plain `Error` so callers can branch on it (e.g. highlight a field). */
export function apiError(message: string, code?: string): Error & {code?: string} {
  const err = new Error(message) as Error & {code?: string};
  err.code = code;
  return err;
}

/** Convenience: extract message + code from a caught error and rethrow as a normalised `Error`. */
export function rethrowApiError(e: unknown, fallback: string): never {
  throw apiError(extractErrorMessage(e, fallback), extractErrorCode(e));
}
