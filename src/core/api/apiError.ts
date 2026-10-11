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

/** Pulls the HTTP status off a caught error, if present (0 means a network/timeout failure, no response at all). */
export function extractErrorStatus(e: unknown): number | undefined {
  if (e && typeof e === 'object' && 'status' in e && typeof (e as {status?: unknown}).status === 'number') {
    return (e as {status: number}).status;
  }
  return undefined;
}

/** Pulls the backend's error `details` payload (e.g. `{attemptsLeft, retryAfterSeconds}`) off a caught error, if present. */
export function extractErrorDetails(e: unknown): Record<string, unknown> | undefined {
  if (e && typeof e === 'object' && 'details' in e && typeof (e as {details?: unknown}).details === 'object') {
    return (e as {details?: Record<string, unknown>}).details;
  }
  return undefined;
}

/** Attaches the backend's error `code`/`status`/`details` to a plain `Error` so callers can branch on it (e.g. highlight a field, read `attemptsLeft`). */
export function apiError(
  message: string,
  code?: string,
  status?: number,
  details?: Record<string, unknown>,
): Error & {code?: string; status?: number; details?: Record<string, unknown>} {
  const err = new Error(message) as Error & {code?: string; status?: number; details?: Record<string, unknown>};
  err.code = code;
  err.status = status;
  err.details = details;
  return err;
}

/** Convenience: extract message + code (+ status/details) from a caught error and rethrow as a normalised `Error`. */
export function rethrowApiError(e: unknown, fallback: string): never {
  throw apiError(extractErrorMessage(e, fallback), extractErrorCode(e), extractErrorStatus(e), extractErrorDetails(e));
}
