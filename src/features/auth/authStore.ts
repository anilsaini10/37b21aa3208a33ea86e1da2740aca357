/**
 * Auth store (Zustand).
 *
 * Single source of truth for the current session. Persists to storage so the
 * app resumes logged-in, and exposes role + permission helpers used by the
 * navigation guards.
 */
import {create} from 'zustand';
import {storage, StorageKeys} from '../../core/storage/storage';
import {authApi} from './authApi';
import type {AuthSession, AuthUser, UserRole} from '../../shared/types';
import type {PermissionKey} from '../../core/config/permissions';
import {hasPermission} from '../../core/config/permissions';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  hydrate: () => void;
  setSession: (session: AuthSession) => void;
  loginWithPassword: (role: UserRole, identifier: string, password: string) => Promise<boolean>;
  verifyOtp: (phone: string, otp: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  can: (permission: PermissionKey) => boolean;
}

function persistSession(session: AuthSession): void {
  storage.set(StorageKeys.AUTH_TOKEN, session.tokens.accessToken);
  storage.set(StorageKeys.REFRESH_TOKEN, session.tokens.refreshToken);
  storage.setObject(StorageKeys.AUTH_USER, session.user);
}

function clearSession(): void {
  storage.delete(StorageKeys.AUTH_TOKEN);
  storage.delete(StorageKeys.REFRESH_TOKEN);
  storage.delete(StorageKeys.AUTH_USER);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  hydrate: () => {
    const user = storage.getObject<AuthUser>(StorageKeys.AUTH_USER);
    const token = storage.getString(StorageKeys.AUTH_TOKEN);
    if (user && token) {
      set({user, isAuthenticated: true});
    }
  },

  setSession: (session: AuthSession) => {
    persistSession(session);
    set({user: session.user, isAuthenticated: true, error: null});
  },

  loginWithPassword: async (role, identifier, password) => {
    set({isLoading: true, error: null});
    try {
      const session = await authApi.loginWithPassword(role, identifier, password);
      persistSession(session);
      set({user: session.user, isAuthenticated: true, isLoading: false});
      return true;
    } catch (e) {
      set({isLoading: false, error: (e as Error).message});
      return false;
    }
  },

  verifyOtp: async (phone, otp) => {
    set({isLoading: true, error: null});
    try {
      const session = await authApi.verifyOtp(phone, otp);
      persistSession(session);
      set({user: session.user, isAuthenticated: true, isLoading: false});
      return true;
    } catch (e) {
      set({isLoading: false, error: (e as Error).message});
      return false;
    }
  },

  logout: async () => {
    await authApi.logout();
    clearSession();
    set({user: null, isAuthenticated: false, error: null});
  },

  clearError: () => set({error: null}),

  can: (permission) => {
    const user = get().user;
    return user ? hasPermission(user.permissions, permission) : false;
  },
}));
