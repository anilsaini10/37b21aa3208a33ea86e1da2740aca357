import {useCallback} from 'react';
import {usePermissionsStore} from './permissionsStore';
import {useAuthStore} from './authStore';
import type {PermissionKey} from '../../core/config/permissions';

export interface UsePermissionsReturn {
  permissions: Record<string, unknown>;
  loading: boolean;
  error: boolean;
  can: (key: PermissionKey) => boolean;
  value: <T = unknown>(key: string, fallback: T) => T;
  refresh: () => Promise<void>;
}

export function usePermissions(): UsePermissionsReturn {
  const permissions = usePermissionsStore(s => s.permissions);
  const loading = usePermissionsStore(s => s.loading);
  const error = usePermissionsStore(s => s.error);
  const can = usePermissionsStore(s => s.can);
  const valueFn = usePermissionsStore(s => s.value);
  const fetchPerms = usePermissionsStore(s => s.fetch);
  const userId = useAuthStore(s => s.user?.id);

  const refresh = useCallback(async () => {
    if (userId) {
      await fetchPerms(userId);
    }
  }, [userId, fetchPerms]);

  return {permissions, loading, error, can, value: valueFn, refresh};
}
