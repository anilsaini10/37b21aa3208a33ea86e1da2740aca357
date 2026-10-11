/**
 * Mobile OTP login — centralised error → UI-action mapping, shared by the
 * phone screen (LoginScreen's "Mobile OTP" tab) and the OTP screen
 * (OtpLoginScreen), for both `/login/otp/send` and `/login/otp/verify`.
 *
 * Every call site branches on `error.code` via this one switch instead of
 * re-deriving behaviour from the raw error, so the backend's code → behaviour
 * contract lives in exactly one place.
 */
import {extractErrorCode, extractErrorDetails, extractErrorMessage, extractErrorStatus} from '../../core/api/apiError';
import {logger} from '../../core/utils/logger';

export type OtpErrorAction =
  /** Wrong/expired-but-still-attemptable OTP — stay on the OTP screen, clear the input. */
  | {kind: 'invalid_otp'; message: string; attemptsLeft?: number}
  /** Too many wrong attempts, or the OTP itself expired — input must be locked until the user resends. */
  | {kind: 'attempts_exceeded'; message: string}
  /** Number isn't registered, or the account is inactive — the OTP step can't continue at all. */
  | {kind: 'not_registered_or_inactive'; message: string}
  /** A still-valid OTP was already sent recently — not a failure, just "use the one already sent". */
  | {kind: 'cooldown'; message: string; retryAfterSeconds: number}
  /** Hourly send limit hit — block sending/resending until this many seconds pass. */
  | {kind: 'limit_reached'; message: string; retryAfterSeconds: number}
  /** Bad input (should normally be caught client-side first) — show inline, stay put. */
  | {kind: 'field_error'; message: string}
  /** Transient failure (network, timeout, 5xx, SMS provider down) — safe to just retry. */
  | {kind: 'retryable'; message: string};

function numberDetail(details: Record<string, unknown> | undefined, key: string): number | undefined {
  const value = details?.[key];
  return typeof value === 'number' ? value : undefined;
}

/** Strips a leading `"field: "` prefix some VALIDATION_ERROR messages come with (e.g. `"phone: Enter a valid..."`). */
function stripFieldPrefix(message: string): string {
  return message.replace(/^[a-zA-Z]+:\s*/, '');
}

export function interpretOtpError(e: unknown): OtpErrorAction {
  const code = extractErrorCode(e);
  const status = extractErrorStatus(e);
  const details = extractErrorDetails(e);
  const fallback =
    status === 0 ? 'No internet connection. Please try again.' : 'Something went wrong. Please try again.';
  const message = extractErrorMessage(e, fallback);

  switch (code) {
    case 'PHONE_NOT_REGISTERED':
    case 'ACCOUNT_INACTIVE':
      return {kind: 'not_registered_or_inactive', message};

    case 'OTP_RESEND_COOLDOWN':
      return {kind: 'cooldown', message, retryAfterSeconds: numberDetail(details, 'retryAfterSeconds') ?? 60};

    case 'OTP_LIMIT_REACHED':
      return {kind: 'limit_reached', message, retryAfterSeconds: numberDetail(details, 'retryAfterSeconds') ?? 3600};

    case 'VALIDATION_ERROR':
      return {kind: 'field_error', message: stripFieldPrefix(message)};

    case 'SCHOOL_ID_REQUIRED':
      logger.warn('OTP request sent without schoolId for a role that requires it — app bug', e);
      return {kind: 'field_error', message: 'Something went wrong. Please try again.'};

    case 'INVALID_OTP':
      return {kind: 'invalid_otp', message, attemptsLeft: numberDetail(details, 'attemptsLeft')};

    case 'OTP_ATTEMPTS_EXCEEDED':
    case 'OTP_EXPIRED':
      return {kind: 'attempts_exceeded', message};

    case 'OTP_SEND_FAILED':
    default:
      return {kind: 'retryable', message};
  }
}
