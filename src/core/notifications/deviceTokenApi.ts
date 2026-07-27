/**
 * Backend device-token registration — `POST /api/notifications/register` /
 * `.../unregister`. Tells the backend which FCM token belongs to the
 * currently logged-in user so server-triggered pushes reach this device.
 * Register on login, on app start (if already logged in) and on FCM token
 * refresh; unregister on logout, while the session's still valid. Register
 * is an upsert — calling it repeatedly with the same token is safe.
 */
import {axiosClient} from '../api/axiosClient';
import {Endpoints} from '../api/apiConfig';
import {rethrowApiError} from '../api/apiError';
import type {DevicePlatform} from './pushService';

export interface DeviceTokenRecord {
  id: string;
  userId: string;
  token: string;
  platform: DevicePlatform | null;
  createdAt: string;
  updatedAt: string;
}

interface RegisterDeviceResponse {
  deviceToken: DeviceTokenRecord;
}

export const deviceTokenApi = {
  register: async (token: string, platform?: DevicePlatform): Promise<DeviceTokenRecord> => {
    try {
      const {data} = await axiosClient.post<RegisterDeviceResponse>(Endpoints.notifications.register, {
        token,
        platform,
      });
      return data.deviceToken;
    } catch (e) {
      console.error('deviceTokenApi.register failed', e);
      rethrowApiError(e, 'Failed to register device for notifications.');
    }
  },

  unregister: async (token: string): Promise<void> => {
    try {
      await axiosClient.post(Endpoints.notifications.unregister, {token});
    } catch (e) {
      console.error('deviceTokenApi.unregister failed', e);
      rethrowApiError(e, 'Failed to unregister device.');
    }
  },
};
