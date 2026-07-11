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
import type {AuthSession, AuthUser, UserRole} from '../../shared/types';
import type {PermissionKey} from '../../core/config/permissions';
import {hasPermission} from '../../core/config/permissions';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  /** Backend error code (e.g. `EMAIL_TAKEN`, `VALIDATION_ERROR`) for the last failed auth action, if any. */
  errorCode: string | null;

  hydrate: () => void;
  setSession: (session: AuthSession) => void;
  signup: (input: SignupInput) => Promise<boolean>;
  loginWithPassword: (
    role: UserRole,
    identifier: string,
    password: string,
    schoolId?: string,
  ) => Promise<boolean>;
  verifyOtp: (phone: string, otp: string, schoolId: string, schoolName: string) => Promise<boolean>;
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

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  errorCode: null,

  hydrate: () => {
    const user = storage.getObject<AuthUser>(StorageKeys.AUTH_USER);
    const token = storage.getString(StorageKeys.AUTH_TOKEN);
    if (user && token) {
      set({user, isAuthenticated: true});
    }
  },

  setSession: (session: AuthSession) => {
    persistSession(session);
    set({user: session.user, isAuthenticated: true, error: null, errorCode: null});
  },

  signup: async (input: SignupInput) => {
    set({isLoading: true, error: null, errorCode: null});
    try {
      const session = await authApi.signup(input);
      persistSession(session);
      set({user: session.user, isAuthenticated: true, isLoading: false});
      return true;
    } catch (e) {
      const message = (e as {message?: string}).message ?? 'Signup failed. Please try again.';
      const code = (e as {code?: string}).code ?? null;
      set({isLoading: false, error: message, errorCode: code});
      return false;
    }
  },

  loginWithPassword: async (role, identifier, password, schoolId) => {
    set({isLoading: true, error: null, errorCode: null});
    try {
      const session = await authApi.loginWithPassword(role, identifier, password, schoolId);
      persistSession(session);
      set({user: session.user, isAuthenticated: true, isLoading: false});
      return true;
    } catch (e) {
      const message = (e as {message?: string}).message ?? 'Login failed. Please try again.';
      const code = (e as {code?: string}).code ?? null;
      set({isLoading: false, error: message, errorCode: code});
      return false;
    }
  },

  verifyOtp: async (phone, otp, schoolId, schoolName) => {
    set({isLoading: true, error: null, errorCode: null});
    try {
      const session = await authApi.verifyOtp(phone, otp, schoolId, schoolName);
      persistSession(session);
      set({user: session.user, isAuthenticated: true, isLoading: false});
      return true;
    } catch (e) {
      const message = (e as {message?: string}).message ?? 'Verification failed. Please try again.';
      set({isLoading: false, error: message, errorCode: null});
      return false;
    }
  },

  logout: async () => {
    await authApi.logout();
    clearSession();
    set({user: null, isAuthenticated: false, error: null, errorCode: null});
  },

  forceLogout: () => {
    clearSession();
    set({user: null, isAuthenticated: false, error: null, errorCode: null});
  },

  clearError: () => set({error: null, errorCode: null}),

  can: (permission) => {
    const user = get().user;
    return user ? hasPermission(user.permissions, permission) : false;
  },
}));
