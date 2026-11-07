import {create} from 'zustand';
import {AppState} from 'react-native';
import {storage, StorageKeys} from '../../core/storage/storage';
import {fetchMyPermissions} from './permissionsApi';
import {logger} from '../../core/utils/logger';
import type {PermissionKey} from '../../core/config/permissions';

const STALE_MS = 5 * 60 * 1000;

interface PermissionsCache {
  userId: string;
  role: string;
  permissions: Record<string, unknown>;
  isSuperAdmin: boolean;
  fetchedAt: number;
}

interface PermissionsState {
  permissions: Record<string, unknown>;
  role: string | null;
  isSuperAdmin: boolean;
  loading: boolean;
  error: boolean;
  fetchedAt: number;

  hydrateFromCache: (userId: string) => void;
  fetch: (userId: string) => Promise<void>;
  clear: () => void;
  can: (key: PermissionKey) => boolean;
  value: <T = unknown>(key: string, fallback: T) => T;
}

function readCache(): PermissionsCache | undefined {
  return storage.getObject<PermissionsCache>(StorageKeys.PERMISSIONS_CACHE);
}

function writeCache(cache: PermissionsCache): void {
  storage.setObject(StorageKeys.PERMISSIONS_CACHE, cache);
}

function clearCache(): void {
  storage.delete(StorageKeys.PERMISSIONS_CACHE);
}

export const usePermissionsStore = create<PermissionsState>((set, get) => ({
  permissions: {},
  role: null,
  isSuperAdmin: false,
  loading: false,
  error: false,
  fetchedAt: 0,

  hydrateFromCache: (userId: string) => {
    const cache = readCache();
    if (cache && cache.userId === userId) {
      set({
        permissions: cache.permissions,
        role: cache.role,
        isSuperAdmin: cache.isSuperAdmin ?? false,
        fetchedAt: cache.fetchedAt,
        error: false,
      });
    }
  },

  fetch: async (userId: string) => {
    set({loading: true, error: false});
    try {
      const data = await fetchMyPermissions();
      const now = Date.now();
      set({
        permissions: data.permissions,
        role: data.role,
        isSuperAdmin: data.isSuperAdmin ?? false,
        loading: false,
        fetchedAt: now,
        error: false,
      });
      writeCache({userId, role: data.role, permissions: data.permissions, isSuperAdmin: data.isSuperAdmin ?? false, fetchedAt: now});
    } catch {
      const state = get();
      if (Object.keys(state.permissions).length === 0) {
        set({loading: false, error: true});
      } else {
        set({loading: false});
      }
    }
  },

  clear: () => {
    clearCache();
    set({permissions: {}, role: null, isSuperAdmin: false, loading: false, error: false, fetchedAt: 0});
  },

  can: (key: PermissionKey) => {
    const state = get();
    if (state.isSuperAdmin) return true;
    return state.permissions[key] === true;
  },

  value: <T = unknown>(key: string, fallback: T): T => {
    const v = get().permissions[key];
    return v !== undefined ? (v as T) : fallback;
  },
}));

let appStateListener: ReturnType<typeof AppState.addEventListener> | null = null;

export function startPermissionsAppStateListener(getUserId: () => string | undefined): void {
  stopPermissionsAppStateListener();
  appStateListener = AppState.addEventListener('change', (nextState) => {
    if (nextState === 'active') {
      const userId = getUserId();
      if (!userId) {
        return;
      }
      const {fetchedAt} = usePermissionsStore.getState();
      if (Date.now() - fetchedAt > STALE_MS) {
        usePermissionsStore.getState().fetch(userId);
      }
    }
  });
}

export function stopPermissionsAppStateListener(): void {
  appStateListener?.remove();
  appStateListener = null;
}
