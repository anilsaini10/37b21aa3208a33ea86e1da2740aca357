/**
 * Which backend the app talks to — the ONE place to switch between servers.
 *
 *   live → the deployed backend on Render
 *   demo → the local dev backend (`http://10.0.2.2:5000` = your computer, as seen from the Android emulator)
 *
 * To switch: change `ACTIVE_API_ENV` below and reload the app (Metro reload is enough, no rebuild).
 *
 * Note: base URLs are the server root WITHOUT `/api` — every endpoint path in
 * `Endpoints` already starts with `/api/...`. `getBaseUrl()` strips a trailing
 * `/api` anyway, so pasting a URL that ends in `/api` can't produce `/api/api/...`.
 */

export type ApiEnvironment = 'live' | 'demo';

const API_URLS: Record<ApiEnvironment, string> = {
  live: 'https://zero5aa0834a03bba18f7cc427f42a8ba49.onrender.com',
  demo: 'http://10.0.2.2:5000',
};

// 👇 Switch here: 'live' or 'demo'.
export const ACTIVE_API_ENV = 'demo' as ApiEnvironment;

/** Server root for an environment (defaults to the active one), without a trailing `/` or `/api`. */
export function getBaseUrl(env: ApiEnvironment = ACTIVE_API_ENV): string {
  return API_URLS[env].replace(/\/+$/, '').replace(/\/api$/, '');
}

export const BASE_URL = getBaseUrl();

export const IS_LIVE_API = ACTIVE_API_ENV === 'live';
