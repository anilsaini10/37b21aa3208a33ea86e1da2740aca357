/**
 * Environment configuration.
 *
 * In a real project these values come from `.env` files via
 * `react-native-config`. Here they are inlined with sensible dev defaults so
 * the dummy-API starter runs immediately.
 */
export interface AppEnv {
  API_BASE_URL: string;
  API_TIMEOUT_MS: number;
  /** When true, the app serves dummy data instead of hitting a real backend. */
  USE_MOCK_API: boolean;
  ENABLE_LOGGING: boolean;
}

export const ENV: AppEnv = {
  API_BASE_URL: 'http://10.0.2.2:5000',
  // A few admin write endpoints (announcements/events create+update, leave
  // approve/reject) now await a push-notification send server-side before
  // responding — can take a couple seconds for a large school, occasionally
  // more. 15s was cutting it close; bumped globally rather than special-casing
  // six endpoints, since a longer timeout is harmless for the fast ones too.
  API_TIMEOUT_MS: 20000,
  USE_MOCK_API: true,
  ENABLE_LOGGING: __DEV__,
};
