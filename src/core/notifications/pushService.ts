/**
 * Firebase Cloud Messaging — push notifications, wired dynamically into the
 * local notifee pipeline (see `notificationService.ts`). Foreground,
 * background and tap-to-open handlers all derive their title/body/category
 * purely from the remote message that arrives — nothing feature-specific is
 * hardcoded here, so any backend-triggered push (fee reminder, attendance
 * alert, homework, announcement, ...) is displayed and routed the same way.
 *
 * Platform differences are handled internally (e.g. iOS requires
 * `registerDeviceForRemoteMessages()` before a token is available; Android
 * does not) so callers never need to branch on `Platform.OS` themselves.
 */
import messaging, {AuthorizationStatus, type FirebaseMessagingTypes} from '@react-native-firebase/messaging';
import {Platform} from 'react-native';
import {displayLocalNotification, type NotificationCategory} from './notificationService';
import {logger} from '../utils/logger';

export type RemoteMessage = FirebaseMessagingTypes.RemoteMessage;

function isAuthorized(status: FirebaseMessagingTypes.AuthorizationStatus): boolean {
  return status === AuthorizationStatus.AUTHORIZED || status === AuthorizationStatus.PROVISIONAL;
}

/** Ask the user for push permission. iOS prompts; Android resolves immediately (no prompt needed pre-13, notifee/OS handles 13+). */
export async function requestPushPermission(): Promise<boolean> {
  const status = await messaging().requestPermission();
  return isAuthorized(status);
}

/** Check the current permission WITHOUT prompting — e.g. to render an enabled/disabled state in Settings. */
export async function hasPushPermission(): Promise<boolean> {
  const status = await messaging().hasPermission();
  return isAuthorized(status);
}

/**
 * Fetch this device's FCM registration token — the value a backend uses to
 * target this specific device/install with a push. Returns null if it can't
 * be obtained (e.g. no Firebase config on this platform yet).
 */
export async function getDeviceToken(): Promise<string | null> {
  try {
    if (Platform.OS === 'ios') {
      await messaging().registerDeviceForRemoteMessages();
    }
    return await messaging().getToken();
  } catch (e) {
    logger.warn('Failed to obtain FCM device token', e);
    return null;
  }
}

/** Re-fetch the token whenever FCM rotates it (e.g. to keep a backend record in sync). Returns an unsubscribe function. */
export function onDeviceTokenRefresh(onToken: (token: string) => void): () => void {
  return messaging().onTokenRefresh(onToken);
}

const KNOWN_CATEGORIES: NotificationCategory[] = [
  'fee',
  'attendance',
  'exam',
  'homework',
  'announcement',
  'general',
];

function categoryFromData(data?: FirebaseMessagingTypes.RemoteMessage['data']): NotificationCategory | undefined {
  const type = data?.type;
  return typeof type === 'string' && (KNOWN_CATEGORIES as string[]).includes(type)
    ? (type as NotificationCategory)
    : undefined;
}

async function displayRemoteMessage(message: RemoteMessage): Promise<void> {
  const title = message.notification?.title ?? (message.data?.title as string | undefined);
  const body = message.notification?.body ?? (message.data?.body as string | undefined);
  if (!title && !body) {
    return;
  }
  await displayLocalNotification({
    id: message.messageId,
    title: title ?? '',
    body: body ?? '',
    category: categoryFromData(message.data),
    data: message.data,
  });
}

/**
 * Foreground messages never auto-display on either platform — call this once
 * (from app bootstrap) to pipe them through notifee like any other in-app
 * notification. Returns an unsubscribe function.
 */
export function registerForegroundHandler(): () => void {
  return messaging().onMessage(async remoteMessage => {
    await displayRemoteMessage(remoteMessage);
  });
}

/**
 * Must be called at the top level of `index.js`, before
 * `AppRegistry.registerComponent` — Firebase invokes this outside the React
 * tree (and even while the Android app process is fully killed) whenever a
 * message arrives in the background.
 */
export function registerBackgroundHandler(): void {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    await displayRemoteMessage(remoteMessage);
  });
}

/**
 * Handle the user tapping a notification that opened the app — both from a
 * backgrounded state (`onNotificationOpenedApp`) and a cold start
 * (`getInitialNotification`). `onOpen` receives the message's own `data`
 * payload so the caller can decide where to navigate, dynamically.
 */
export function registerNotificationOpenedHandlers(
  onOpen: (data: FirebaseMessagingTypes.RemoteMessage['data']) => void,
): () => void {
  const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
    onOpen(remoteMessage.data);
  });

  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        onOpen(remoteMessage.data);
      }
    })
    .catch(e => logger.warn('Failed to read initial push notification', e));

  return unsubscribe;
}
