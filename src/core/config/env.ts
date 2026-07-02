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
  API_BASE_URL: 'https://api.schoolms.example.com/v1',
  API_TIMEOUT_MS: 15000,
  USE_MOCK_API: true,
  ENABLE_LOGGING: __DEV__,
};
