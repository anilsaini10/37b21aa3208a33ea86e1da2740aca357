import {NativeModules} from 'react-native';
import {sendJsCrashReport} from './crashReportService';

const {CrashHandler} = NativeModules;

export const crashHandler = {
  install(): Promise<boolean> {
    return CrashHandler.install();
  },

  getDeviceMetadata(): Promise<{
    platform: string;
    osVersion: string;
    deviceModel: string;
    appVersion: string;
    buildNumber: string;
    freeMemory: number;
    batteryLevel: number;
  }> {
    return CrashHandler.getDeviceMetadata();
  },
};

export function setupGlobalErrorHandler() {
  const originalHandler = ErrorUtils.getGlobalHandler();

  ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
    sendJsCrashReport(error, isFatal ?? false).catch(() => {});
    originalHandler?.(error, isFatal);
  });

  crashHandler.install().catch(() => {});
}
