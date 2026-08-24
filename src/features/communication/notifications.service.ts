/**
 * Notifications inbox — real backend (Express + Prisma).
 *
 * Independent of push/FCM: this is the permanent record of every notification
 * a user was sent, regardless of whether the push itself was delivered.
 */
import {useEffect} from 'react';
import {AppState} from 'react-native';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';
import type {AppNotification, Paginated} from '../../shared/types';

export interface NotificationListParams {
  page?: number;
  pageSize?: number;
  /** Omit to get both read and unread. */
  isRead?: boolean;
  type?: string;
}

export interface NotificationsPage extends Paginated<AppNotification> {
  unreadCount: number;
}

function toApiParams(params?: NotificationListParams): Record<string, string | number> | undefined {
  if (!params) {
    return undefined;
  }
  const apiParams: Record<string, string | number> = {};
  if (params.page !== undefined) {
    apiParams.page = params.page;
  }
  if (params.pageSize !== undefined) {
    apiParams.pageSize = params.pageSize;
  }
  if (params.isRead !== undefined) {
    apiParams.isRead = String(params.isRead);
  }
  if (params.type !== undefined) {
    apiParams.type = params.type;
  }
  return apiParams;
}

export const notificationsApi = {
  list: async (params?: NotificationListParams): Promise<NotificationsPage> => {
    try {
      const {data} = await axiosClient.get<NotificationsPage>(Endpoints.notifications.list, {
        params: toApiParams(params),
      });
      return data;
    } catch (e) {
      console.error('notificationsApi.list failed', e);
      rethrowApiError(e, 'Failed to load notifications.');
    }
  },

  unreadCount: async (): Promise<number> => {
    try {
      const {data} = await axiosClient.get<{unreadCount: number}>(Endpoints.notifications.unreadCount);
      return data.unreadCount;
    } catch (e) {
      console.error('notificationsApi.unreadCount failed', e);
      rethrowApiError(e, 'Failed to load unread notification count.');
    }
  },

  markRead: async (id: string): Promise<AppNotification> => {
    try {
      const {data} = await axiosClient.patch<AppNotification>(Endpoints.notifications.markRead(id));
      return data;
    } catch (e) {
      console.error('notificationsApi.markRead failed', e);
      rethrowApiError(e, 'Failed to mark notification as read.');
    }
  },

  markAllRead: async (): Promise<number> => {
    try {
      const {data} = await axiosClient.patch<{updated: number}>(Endpoints.notifications.markAllRead);
      return data.updated;
    } catch (e) {
      console.error('notificationsApi.markAllRead failed', e);
      rethrowApiError(e, 'Failed to mark all notifications as read.');
    }
  },
};

export const useNotificationsList = (params?: NotificationListParams) =>
  useQuery({queryKey: ['notifications', 'list', params], queryFn: () => notificationsApi.list(params)});

/** Cheap/fast — also refetches whenever the app comes to the foreground, so a header badge stays in sync. */
export const useUnreadNotificationsCount = () => {
  const qc = useQueryClient();
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        qc.invalidateQueries({queryKey: ['notifications', 'unreadCount']});
      }
    });
    return () => sub.remove();
  }, [qc]);

  return useQuery({queryKey: ['notifications', 'unreadCount'], queryFn: notificationsApi.unreadCount});
};

export const useMarkNotificationRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({queryKey: ['notifications']}),
  });
};

export const useMarkAllNotificationsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => qc.invalidateQueries({queryKey: ['notifications']}),
  });
};
