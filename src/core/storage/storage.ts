/**
 * Typed storage facade.
 *
 * Wraps the active `KeyValueStore` backend and adds JSON object helpers. The
 * backend defaults to an in-memory store and is swapped for MMKV at bootstrap
 * via `registerStorageBackend()`. All app + feature code imports `storage`
 * from here.
 */
import type {KeyValueStore} from './types';
import {MemoryStore} from './memoryStore';

let backend: KeyValueStore = new MemoryStore();

/** Replace the active backend (called once at app bootstrap with MMKV). */
export function registerStorageBackend(next: KeyValueStore): void {
  backend = next;
}

export const storage = {
  getString: (key: string) => backend.getString(key),
  getBoolean: (key: string) => backend.getBoolean(key),
  getNumber: (key: string) => backend.getNumber(key),
  set: (key: string, value: string | number | boolean) => backend.set(key, value),
  delete: (key: string) => backend.delete(key),
  contains: (key: string) => backend.contains(key),
  getAllKeys: () => backend.getAllKeys(),
  clearAll: () => backend.clearAll(),

  /** Store a serialisable object as JSON. */
  setObject<T>(key: string, value: T): void {
    backend.set(key, JSON.stringify(value));
  },

  /** Read + parse a JSON object, or `undefined` when absent/corrupt. */
  getObject<T>(key: string): T | undefined {
    const raw = backend.getString(key);
    if (raw === undefined) {
      return undefined;
    }
    try {
      return JSON.parse(raw) as T;
    } catch {
      return undefined;
    }
  },
};

/** Storage keys used across the app (single source of truth). */
export const StorageKeys = {
  AUTH_TOKEN: 'auth.token',
  REFRESH_TOKEN: 'auth.refreshToken',
  AUTH_USER: 'auth.user',
  THEME_KEY: 'theme.key',
  THEME_MODE: 'theme.mode',
  FONT_SCALE: 'theme.fontScale',
  LANGUAGE: 'app.language',
  ONBOARDING_DONE: 'app.onboardingDone',
  SYNC_QUEUE: 'offline.syncQueue',
  CACHE_PREFIX: 'cache.',
  PUSH_DEVICE_TOKEN: 'notifications.deviceToken',
} as const;
