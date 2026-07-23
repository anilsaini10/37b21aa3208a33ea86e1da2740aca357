import {respond, fail} from '../../core/mock/mockApi';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';
import {permissionsForRole} from '../../core/config/permissions';
import {generateId} from '../../core/utils/misc';
import {logger} from '../../core/utils/logger';
import type {AuthSession, AuthTokens, AuthUser, UserRole} from '../../shared/types';

/** Signup is admin-only — creating an admin account also creates their school. */
export interface SignupInput {
  schoolName: string;
  name: string;
  email: string;
  phone: string;
  password: string;
}

/** Raw shape the real backend responds with. `role` comes back upper-case
 * ("ADMIN") and `tokens.expiresAt` as an ISO datetime string — both get
 * normalised in `toAuthUser`/the token mapping below. */
interface AuthApiUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  schoolId?: string;
  schoolName?: string;
}
interface AuthApiResponse {
  user: AuthApiUser;
  accessToken?: string;
  refreshToken?: string;
  tokens?: {accessToken: string; refreshToken: string; expiresAt?: string | number};
}

/** Backend sends `expiresAt` as an ISO string; the app stores epoch ms everywhere else. */
function toExpiresAtMs(value: string | number | undefined, fallbackMs: number): number {
  if (value === undefined) {
    return fallbackMs;
  }
  const ms = typeof value === 'number' ? value : new Date(value).getTime();
  return Number.isFinite(ms) ? ms : fallbackMs;
}

/** Fills in whatever the backend response leaves out — e.g. echoes back the
 * school the caller signed up with / picked, since the backend may not yet
 * return school fields on every response. */
function toAuthUser(
  raw: AuthApiUser,
  fallback: {role: UserRole; schoolId?: string; schoolName?: string},
): AuthUser {
  const role = (raw.role ? raw.role.toLowerCase() : fallback.role) as UserRole;
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    phone: raw.phone ?? '',
    role,
    status: 'active',
    createdAt: new Date().toISOString(),
    schoolId: raw.schoolId ?? fallback.schoolId ?? generateId('sch'),
    schoolName: raw.schoolName ?? fallback.schoolName ?? '',
    permissions: permissionsForRole(role),
  };
}

export const authApi = {
  /** Hits the real Node/Express/Postgres backend (not the mock layer). */
  async signup(input: SignupInput): Promise<AuthSession> {
    try {
      const {data} = await axiosClient.post<AuthApiResponse>(Endpoints.auth.signup, input);
      console.log('authApi.signup response:', data);
      if (!data?.user) {
        throw new Error('Signup succeeded but the server response was missing user data.');
      }
      const tokens: AuthTokens = {
        accessToken: data.tokens?.accessToken ?? data.accessToken ?? '',
        refreshToken: data.tokens?.refreshToken ?? data.refreshToken ?? '',
        expiresAt: toExpiresAtMs(data.tokens?.expiresAt, Date.now() + 15 * 60 * 1000),
      };
      return {user: toAuthUser(data.user, {role: 'admin', schoolName: input.schoolName}), tokens};
    } catch (e) {
      logger.warn('authApi.signup failed', e);
      rethrowApiError(e, 'Signup failed. Please try again.');
    }
  },

  /** Hits the real backend. `schoolId` is only relevant for teacher/parent logins —
   * admins are resolved to the school they created via their own account. */
  async loginWithPassword(
    role: UserRole,
    identifier: string,
    password: string,
    schoolId?: string,
  ): Promise<AuthSession> {
    try {
      const {data} = await axiosClient.post<AuthApiResponse>(Endpoints.auth.login, {
        identifier,
        password,
        // Backend's role enum is upper-case (mirrors what /auth/signup returns).
        role: role.toUpperCase(),
        schoolId,
      });
      if (!data?.user) {
        throw new Error('Login succeeded but the server response was missing user data.');
      }
      const tokens: AuthTokens = {
        accessToken: data.tokens?.accessToken ?? data.accessToken ?? '',
        refreshToken: data.tokens?.refreshToken ?? data.refreshToken ?? '',
        expiresAt: toExpiresAtMs(data.tokens?.expiresAt, Date.now() + 15 * 60 * 1000),
      };
      return {user: toAuthUser(data.user, {role, schoolId}), tokens};
    } catch (e) {
      logger.warn('authApi.loginWithPassword failed', e);
      rethrowApiError(e, 'Login failed. Please check your credentials and try again.');
    }
  },

  async forgotPassword(identifier: string): Promise<{sent: true}> {
    if (!identifier.trim()) {
      return fail('Please enter your registered email or mobile.');
    }
    return respond({sent: true});
  },

  async logout(): Promise<void> {
    return respond(undefined);
  },
};
