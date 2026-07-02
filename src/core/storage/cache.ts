/**
 * Lightweight TTL cache backed by persistent storage (offline-first reads).
 *
 * React Query owns in-memory caching; this layer persists selected responses so
 * the app can render meaningful data on cold start while offline.
 */
import {storage, StorageKeys} from './storage';

interface CacheEnvelope<T> {
  value: T;
  expiresAt: number | null;
}

/**
 * @param now Injectable clock (epoch millis) — keeps the module deterministic
 *            in tests. Defaults to `Date.now()` in app code.
 */
export const cache = {
  set<T>(key: string, value: T, ttlMs?: number, now: number = Date.now()): void {
    const envelope: CacheEnvelope<T> = {
      value,
      expiresAt: ttlMs ? now + ttlMs : null,
    };
    storage.setObject(StorageKeys.CACHE_PREFIX + key, envelope);
  },

  get<T>(key: string, now: number = Date.now()): T | undefined {
    const envelope = storage.getObject<CacheEnvelope<T>>(StorageKeys.CACHE_PREFIX + key);
    if (!envelope) {
      return undefined;
    }
    if (envelope.expiresAt !== null && envelope.expiresAt < now) {
      storage.delete(StorageKeys.CACHE_PREFIX + key);
      return undefined;
    }
    return envelope.value;
  },

  invalidate(key: string): void {
    storage.delete(StorageKeys.CACHE_PREFIX + key);
  },

  invalidateAll(): void {
    storage
      .getAllKeys()
      .filter(k => k.startsWith(StorageKeys.CACHE_PREFIX))
      .forEach(k => storage.delete(k));
  },
};
