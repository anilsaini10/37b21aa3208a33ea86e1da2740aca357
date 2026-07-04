/**
 * App bootstrap — one-time synchronous setup run before the UI mounts.
 *
 * Registers the native MMKV storage backend (replacing the default in-memory
 * store) and hydrates the auth session from persisted storage so returning
 * users land straight in their dashboard.
 */
import {registerStorageBackend, storage, StorageKeys} from '../core/storage/storage';
import {mmkvBackend} from '../core/storage/mmkvBackend';
import {
  requestNotificationPermission,
  requestPushPermission,
  getDeviceToken,
  onDeviceTokenRefresh,
  registerForegroundHandler,
  registerNotificationOpenedHandlers,
} from '../core/notifications';
import {useAuthStore} from '../features/auth/authStore';
import {logger} from '../core/utils/logger';

let done = false;

/**
 * Push setup — foreground/opened listeners are registered unconditionally
 * (guarded, since a platform without Firebase configured yet, e.g. iOS
 * without GoogleService-Info.plist, would otherwise throw on app start).
 * Permission is only requested, and a device token only fetched, after that
 * succeeds.
 */
function setupPushNotifications(): void {
  try {
    registerForegroundHandler();
    registerNotificationOpenedHandlers(data => {
      logger.info('Notification opened app', data);
    });
    onDeviceTokenRefresh(token => {
      storage.set(StorageKeys.PUSH_DEVICE_TOKEN, token);
      logger.info('FCM device token refreshed');
    });
  } catch (e) {
    logger.warn('Push notification listeners unavailable', e);
    return;
  }

  requestPushPermission()
    .then(granted => {
      if (!granted) {
        return undefined;
      }
      return getDeviceToken();
    })
    .then(token => {
      if (token) {
        storage.set(StorageKeys.PUSH_DEVICE_TOKEN, token);
        logger.info('FCM device token', token);
      }
    })
    .catch(e => logger.warn('Push permission/token setup failed', e));
}

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

  requestNotificationPermission().catch(e => {
    // Local notifications unavailable (e.g. simulator without entitlements, or denied) — non-fatal.
    logger.warn('Notification permission request failed', e);
  });

  setupPushNotifications();
}
