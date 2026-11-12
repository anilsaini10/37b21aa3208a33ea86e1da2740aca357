import {NativeModules, Platform} from 'react-native';
import {axiosClient} from '../api/axiosClient';
import {Endpoints} from '../api/apiConfig';
import {storage, StorageKeys} from '../storage/storage';
import {logger} from './logger';
import {getCurrentRouteName} from '../../navigation/navigationRef';

const {CrashHandler} = NativeModules;

const QUEUE_KEY = StorageKeys.CRASH_REPORT_QUEUE;
let appStartTime = Date.now();

export function resetAppStartTime() {
  appStartTime = Date.now();
}

export interface CrashReportPayload {
  errorMessage: string;
  stackTrace?: string;
  errorType?: string;
  isFatal: boolean;
  crashedAt: string;
  platform: 'ANDROID' | 'IOS';
  appVersion: string;
  buildNumber: string;
  osVersion: string;
  deviceModel: string;
  metadata?: Record<string, string | boolean>;
}

interface PendingNativeCrash {
  fileName: string;
  payload: string;
  timestamp: number;
}

async function getDeviceMetadata(): Promise<{
  platform: 'ANDROID' | 'IOS';
  osVersion: string;
  deviceModel: string;
  appVersion: string;
  buildNumber: string;
  freeMemory: number;
  batteryLevel: number;
}> {
  try {
    return await CrashHandler.getDeviceMetadata();
  } catch {
    return {
      platform: Platform.OS === 'ios' ? 'IOS' : 'ANDROID',
      osVersion: `${Platform.OS} ${Platform.Version}`,
      deviceModel: 'unknown',
      appVersion: 'unknown',
      buildNumber: '0',
      freeMemory: -1,
      batteryLevel: -1,
    };
  }
}

function getSessionDuration(): number {
  return Math.round((Date.now() - appStartTime) / 1000);
}

export async function buildCrashPayload(
  error: Error,
  isFatal: boolean,
  errorType?: string,
): Promise<CrashReportPayload> {
  const device = await getDeviceMetadata();
  const user = storage.getObject<{id?: string}>(StorageKeys.AUTH_USER);

  return {
    errorMessage: (error.message || 'Unknown error').slice(0, 5000),
    stackTrace: (error.stack || '').slice(0, 50000),
    errorType: (errorType || error.name || 'JS_ERROR').slice(0, 200),
    isFatal,
    crashedAt: new Date().toISOString(),
    platform: device.platform,
    appVersion: device.appVersion,
    buildNumber: device.buildNumber,
    osVersion: device.osVersion,
    deviceModel: device.deviceModel,
    metadata: {
      screen: getCurrentRouteName() || 'unknown',
      sessionDuration: getSessionDuration().toString(),
      freeMemory: device.freeMemory.toString(),
      batteryLevel: device.batteryLevel.toString(),
      userId: user?.id || '',
    },
  };
}

async function sendToApi(payload: CrashReportPayload): Promise<boolean> {
  const token = storage.getString(StorageKeys.AUTH_TOKEN);
  if (!token) return false;

  try {
    await axiosClient.post(Endpoints.crashReports, payload);
    return true;
  } catch (e: any) {
    if (e?.status === 401) return false;
    return false;
  }
}

function queueLocally(payload: CrashReportPayload) {
  try {
    const existing = storage.getObject<CrashReportPayload[]>(QUEUE_KEY) ?? [];
    existing.push(payload);
    // Keep max 20 queued reports
    const trimmed = existing.slice(-20);
    storage.setObject(QUEUE_KEY, trimmed);
  } catch {
    // Storage full or corrupt — drop silently
  }
}

export async function sendCrashReport(payload: CrashReportPayload): Promise<void> {
  const sent = await sendToApi(payload);
  if (!sent) {
    queueLocally(payload);
  }
}

export async function sendJsCrashReport(error: Error, isFatal: boolean): Promise<void> {
  try {
    const payload = await buildCrashPayload(error, isFatal);

    // Also write to native file as backup
    CrashHandler.logJsError(
      payload.errorMessage,
      payload.stackTrace || '',
      payload.errorType || 'JS_ERROR',
      isFatal,
    ).catch(() => {});

    await sendCrashReport(payload);
  } catch {
    // Best effort — don't let crash reporting crash the app
  }
}

async function flushQueuedReports(): Promise<void> {
  const queued = storage.getObject<CrashReportPayload[]>(QUEUE_KEY);
  if (!queued || queued.length === 0) return;

  const remaining: CrashReportPayload[] = [];
  for (const payload of queued) {
    const sent = await sendToApi(payload);
    if (!sent) {
      remaining.push(payload);
    }
  }

  if (remaining.length === 0) {
    storage.delete(QUEUE_KEY);
  } else {
    storage.setObject(QUEUE_KEY, remaining);
  }
}

async function flushNativeCrashFiles(): Promise<void> {
  try {
    const pending: PendingNativeCrash[] = await CrashHandler.getPendingCrashes();
    if (!pending || pending.length === 0) return;

    const token = storage.getString(StorageKeys.AUTH_TOKEN);
    if (!token) return;

    for (const crash of pending) {
      try {
        const payload: CrashReportPayload = JSON.parse(crash.payload);
        // Attach userId if we have it now but didn't at crash time
        if (payload.metadata && !payload.metadata.userId) {
          const user = storage.getObject<{id?: string}>(StorageKeys.AUTH_USER);
          if (user?.id) payload.metadata.userId = user.id;
        }
        const sent = await sendToApi(payload);
        if (sent) {
          await CrashHandler.deleteCrashFile(crash.fileName);
        }
      } catch {
        // Skip corrupt files
      }
    }
  } catch {
    // Native module unavailable
  }
}

export async function flushPendingCrashReports(): Promise<void> {
  try {
    await Promise.all([
      flushNativeCrashFiles(),
      flushQueuedReports(),
    ]);
  } catch (e) {
    logger.warn('Failed to flush pending crash reports', e);
  }
}
