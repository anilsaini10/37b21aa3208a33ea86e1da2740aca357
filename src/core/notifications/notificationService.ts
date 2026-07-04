/**
 * Local notifications — thin wrapper around notifee.
 *
 * "Dynamic" here means the channel and content are always derived from the
 * caller's own data, never hardcoded: pass any title/body/category and this
 * module picks (and lazily creates) the right Android channel for it. Any
 * feature — fees, attendance, homework, announcements — can push a real
 * device notification through the same two functions instead of each
 * feature wiring up its own channel/permission logic.
 */
import notifee, {AndroidImportance, type AndroidChannel} from '@notifee/react-native';
import {Platform} from 'react-native';
import type {AppNotification} from '../../shared/types';

export type NotificationCategory = AppNotification['type'];

/** One Android channel per category, each with an importance that fits it. */
const CHANNELS: Record<NotificationCategory, AndroidChannel> = {
  fee: {id: 'fee', name: 'Fees', importance: AndroidImportance.HIGH},
  attendance: {id: 'attendance', name: 'Attendance', importance: AndroidImportance.HIGH},
  exam: {id: 'exam', name: 'Exams', importance: AndroidImportance.DEFAULT},
  homework: {id: 'homework', name: 'Homework', importance: AndroidImportance.DEFAULT},
  announcement: {id: 'announcement', name: 'Announcements', importance: AndroidImportance.DEFAULT},
  general: {id: 'general', name: 'General', importance: AndroidImportance.DEFAULT},
};

const ensuredChannels = new Set<string>();

async function ensureChannel(category: NotificationCategory): Promise<string> {
  const channel = CHANNELS[category] ?? CHANNELS.general;
  if (Platform.OS !== 'android') {
    return channel.id;
  }
  if (!ensuredChannels.has(channel.id)) {
    await notifee.createChannel(channel);
    ensuredChannels.add(channel.id);
  }
  return channel.id;
}

/** Ask the user for notification permission. Safe to call more than once. */
export async function requestNotificationPermission(): Promise<boolean> {
  const settings = await notifee.requestPermission();
  return settings.authorizationStatus >= 1; // AUTHORIZED or PROVISIONAL
}

export interface LocalNotificationInput {
  /** Reused as the notifee notification id — pass a stable id to update/replace it later. */
  id?: string;
  title: string;
  body: string;
  category?: NotificationCategory;
  data?: Record<string, string | object | number>;
}

/**
 * Display a local device notification. Every field comes from the caller —
 * nothing here is feature-specific — so this one function serves fee
 * reminders, attendance alerts, homework, announcements, etc.
 */
export async function displayLocalNotification(input: LocalNotificationInput): Promise<void> {
  const channelId = await ensureChannel(input.category ?? 'general');
  const id = input.id ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await notifee.displayNotification({
    id,
    title: input.title,
    body: input.body,
    data: input.data,
    android: {
      channelId,
      pressAction: {id: 'default'},
    },
    ios: {},
  });
}

/** Mirror an in-app `AppNotification` record as a real device notification. */
export function notifyFromAppNotification(notification: AppNotification): Promise<void> {
  return displayLocalNotification({
    id: notification.id,
    title: notification.title,
    body: notification.body,
    category: notification.type,
    data: {type: notification.type},
  });
}
