/**
 * Auth API (mock).
 *
 * Accepts any well-formed credentials and returns a coherent session for the
 * chosen role. Demo hint: any email + password >= 6 chars works; parent OTP is
 * always "1234".
 */
import {respond, fail} from '../../core/mock/mockApi';
import {permissionsForRole} from '../../core/config/permissions';
import {generateId} from '../../core/utils/misc';
import type {AuthSession, AuthUser, UserRole} from '../../shared/types';

const DEMO_OTP = '1234';

function buildSession(role: UserRole, displayName: string, phone: string, email?: string): AuthSession {
  const user: AuthUser = {
    id: generateId('usr'),
    name: displayName,
    email,
    phone,
    role,
    status: 'active',
    createdAt: new Date().toISOString(),
    schoolId: 'sch_1',
    schoolName: 'Greenwood International School',
    permissions: permissionsForRole(role),
  };
  return {
    user,
    tokens: {
      accessToken: generateId('tok'),
      refreshToken: generateId('ref'),
      expiresAt: Date.now() + 60 * 60 * 1000,
    },
  };
}

const ROLE_NAMES: Record<UserRole, string> = {
  admin: 'Principal Sharma',
  teacher: 'Ms. Ananya Iyer',
  parent: 'Mr. Verma',
};

export const authApi = {
  async loginWithPassword(role: UserRole, identifier: string, password: string): Promise<AuthSession> {
    if (!identifier.trim()) {
      return fail('Please enter your email or mobile number.');
    }
    if (password.length < 6) {
      return fail('Invalid credentials. Password must be at least 6 characters.');
    }
    const isEmail = identifier.includes('@');
    return respond(
      buildSession(role, ROLE_NAMES[role], isEmail ? '9000000000' : identifier, isEmail ? identifier : undefined),
    );
  },

  async requestOtp(phone: string): Promise<{sent: true; hint: string}> {
    if (!/^\d{10}$/.test(phone)) {
      return fail('Enter a valid 10-digit mobile number.');
    }
    return respond({sent: true, hint: `Demo OTP is ${DEMO_OTP}`});
  },

  async verifyOtp(phone: string, otp: string): Promise<AuthSession> {
    if (otp !== DEMO_OTP) {
      return fail('Incorrect OTP. Please try again.');
    }
    return respond(buildSession('parent', ROLE_NAMES.parent, phone));
  },

  async forgotPassword(identifier: string): Promise<{sent: true}> {
    if (!identifier.trim()) {
      return fail('Please enter your registered email or mobile.');
    }
    return respond({sent: true});
  },

  async changePassword(current: string, next: string): Promise<{success: true}> {
    if (current.length < 6) {
      return fail('Current password is incorrect.');
    }
    if (next.length < 6) {
      return fail('New password must be at least 6 characters.');
    }
    return respond({success: true});
  },

  async logout(): Promise<void> {
    return respond(undefined);
  },
};
