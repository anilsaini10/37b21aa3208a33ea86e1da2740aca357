/**
 * App bootstrap — one-time synchronous setup run before the UI mounts.
 *
 * Registers the native MMKV storage backend (replacing the default in-memory
 * store) and hydrates the auth session from persisted storage so returning
 * users land straight in their dashboard.
 */
import {registerStorageBackend} from '../core/storage/storage';
import {mmkvBackend} from '../core/storage/mmkvBackend';
import {useAuthStore} from '../features/auth/authStore';
import {logger} from '../core/utils/logger';

let done = false;

export function bootstrap(): void {
  if (done) {
    return;
  }
  done = true;
  try {
    registerStorageBackend(mmkvBackend);
  } catch (e) {
    // MMKV unavailable (e.g. running outside a device) — fall back to memory.
    logger.warn('MMKV backend unavailable, using in-memory storage', e);
  }
  useAuthStore.getState().hydrate();
}
