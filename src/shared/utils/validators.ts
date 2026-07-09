/** Shared client-side validation helpers — mirror the backend's auth validation rules. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value);
}

/** Digits-only phone number, 10-15 digits. */
export function isValidPhoneDigits(value: string): boolean {
  return /^\d{10,15}$/.test(value);
}
