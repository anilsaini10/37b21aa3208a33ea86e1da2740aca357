/**
 * Auth store (Zustand).
 *
 * Single source of truth for the current session. Persists to storage so the
 * app resumes logged-in, and exposes role + permission helpers used by the
 * navigation guards.
 */
import {create} from 'zustand';
import {storage, StorageKeys} from '../../core/storage/storage';
import {authApi, type SignupInput} from './authApi';
import {extractErrorDetails} from '../../core/api/apiError';
import type {AuthSession, AuthUser, UserRole} from '../../shared/types';
import type {PermissionKey} from '../../core/config/permissions';
import {hasPermission} from '../../core/config/permissions';
import {deviceTokenApi, getDeviceToken, currentDevicePlatform} from '../../core/notifications';
import {logger} from '../../core/utils/logger';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  /** Backend error code (e.g. `EMAIL_TAKEN`, `VALIDATION_ERROR`) for the last failed auth action, if any. */
  errorCode: string | null;
  /** Backend `details` payload for the last failed auth action (e.g. `{attemptsLeft}` for `INVALID_OTP`), if any. */
  errorDetails: Record<string, unknown> | null;

  hydrate: () => void;
  setSession: (session: AuthSession) => void;
  signup: (input: SignupInput) => Promise<boolean>;
  loginWithPassword: (
    role: UserRole,
    identifier: string,
    password: string,
    schoolId?: string,
  ) => Promise<boolean>;
  loginWithOtp: (role: UserRole, phone: string, otp: string, schoolId?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  /** Clears the session locally without calling the logout endpoint — used when the
   * backend itself has already invalidated the session (e.g. a 401 on any request). */
  forceLogout: () => void;
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

/** Best-effort — a failed push registration shouldn't block or fail login/signup. */
function registerDeviceTokenBestEffort(): void {
  getDeviceToken()
    .then(token => (token ? deviceTokenApi.register(token, currentDevicePlatform()) : undefined))
    .catch(e => logger.warn('Failed to register device token', e));
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  errorCode: null,
  errorDetails: null,

  hydrate: () => {
    const user = storage.getObject<AuthUser>(StorageKeys.AUTH_USER);
    const token = storage.getString(StorageKeys.AUTH_TOKEN);
    if (user && token) {
      set({user, isAuthenticated: true});
    }
  },

  setSession: (session: AuthSession) => {
    persistSession(session);
    set({user: session.user, isAuthenticated: true, error: null, errorCode: null, errorDetails: null});
    registerDeviceTokenBestEffort();
  },

  signup: async (input: SignupInput) => {
    set({isLoading: true, error: null, errorCode: null, errorDetails: null});
    try {
      const session = await authApi.signup(input);
      persistSession(session);
      set({user: session.user, isAuthenticated: true, isLoading: false});
      registerDeviceTokenBestEffort();
      return true;
    } catch (e) {
      const message = (e as {message?: string}).message ?? 'Signup failed. Please try again.';
      const code = (e as {code?: string}).code ?? null;
      set({isLoading: false, error: message, errorCode: code, errorDetails: extractErrorDetails(e) ?? null});
      return false;
    }
  },

  loginWithPassword: async (role, identifier, password, schoolId) => {
    set({isLoading: true, error: null, errorCode: null, errorDetails: null});
    try {
      const session = await authApi.loginWithPassword(role, identifier, password, schoolId);
      persistSession(session);
      set({user: session.user, isAuthenticated: true, isLoading: false});
      registerDeviceTokenBestEffort();
      return true;
    } catch (e) {
      const message = (e as {message?: string}).message ?? 'Login failed. Please try again.';
      const code = (e as {code?: string}).code ?? null;
      set({isLoading: false, error: message, errorCode: code, errorDetails: extractErrorDetails(e) ?? null});
      return false;
    }
  },

  loginWithOtp: async (role, phone, otp, schoolId) => {
    set({isLoading: true, error: null, errorCode: null, errorDetails: null});
    try {
      const session = await authApi.verifyLoginOtp(phone, otp, role, schoolId);
      persistSession(session);
      set({user: session.user, isAuthenticated: true, isLoading: false});
      registerDeviceTokenBestEffort();
      return true;
    } catch (e) {
      const message = (e as {message?: string}).message ?? 'Login failed. Please try again.';
      const code = (e as {code?: string}).code ?? null;
      set({isLoading: false, error: message, errorCode: code, errorDetails: extractErrorDetails(e) ?? null});
      return false;
    }
  },

  logout: async () => {
    const deviceToken = storage.getString(StorageKeys.PUSH_DEVICE_TOKEN);
    if (deviceToken) {
      try {
        await deviceTokenApi.unregister(deviceToken);
      } catch (e) {
        logger.warn('Failed to unregister device token', e);
      }
    }
    await authApi.logout();
    clearSession();
    set({user: null, isAuthenticated: false, error: null, errorCode: null, errorDetails: null});
  },

  forceLogout: () => {
    clearSession();
    set({user: null, isAuthenticated: false, error: null, errorCode: null, errorDetails: null});
  },

  clearError: () => set({error: null, errorCode: null, errorDetails: null}),

  can: (permission) => {
    const user = get().user;
    return user ? hasPermission(user.permissions, permission) : false;
  },
}));
