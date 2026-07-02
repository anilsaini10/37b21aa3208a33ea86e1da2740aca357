/**
 * Role-based access control (RBAC).
 *
 * Permission keys are the single source of truth for what each role may do.
 * Navigation guards + UI use `hasPermission()` to gate features.
 */
import type {UserRole} from '../../shared/types/user';

export const Permissions = {
  STUDENT_MANAGE: 'student.manage',
  TEACHER_MANAGE: 'teacher.manage',
  FEE_MANAGE: 'fee.manage',
  FEE_VIEW: 'fee.view',
  ATTENDANCE_MARK: 'attendance.mark',
  ATTENDANCE_VIEW: 'attendance.view',
  EXAM_MANAGE: 'exam.manage',
  EXAM_VIEW: 'exam.view',
  HOMEWORK_MANAGE: 'homework.manage',
  HOMEWORK_VIEW: 'homework.view',
  ANNOUNCEMENT_MANAGE: 'announcement.manage',
  TRANSPORT_MANAGE: 'transport.manage',
  LIBRARY_MANAGE: 'library.manage',
  INVENTORY_MANAGE: 'inventory.manage',
  REPORTS_VIEW: 'reports.view',
  SETTINGS_MANAGE: 'settings.manage',
  CHAT: 'chat',
  LEAVE_APPLY: 'leave.apply',
  LEAVE_APPROVE: 'leave.approve',
} as const;

export type PermissionKey = (typeof Permissions)[keyof typeof Permissions];

const ADMIN_PERMISSIONS: PermissionKey[] = Object.values(Permissions);

const TEACHER_PERMISSIONS: PermissionKey[] = [
  Permissions.ATTENDANCE_MARK,
  Permissions.ATTENDANCE_VIEW,
  Permissions.EXAM_MANAGE,
  Permissions.EXAM_VIEW,
  Permissions.HOMEWORK_MANAGE,
  Permissions.HOMEWORK_VIEW,
  Permissions.ANNOUNCEMENT_MANAGE,
  Permissions.REPORTS_VIEW,
  Permissions.CHAT,
  Permissions.LEAVE_APPLY,
];

const PARENT_PERMISSIONS: PermissionKey[] = [
  Permissions.FEE_VIEW,
  Permissions.ATTENDANCE_VIEW,
  Permissions.EXAM_VIEW,
  Permissions.HOMEWORK_VIEW,
  Permissions.CHAT,
  Permissions.LEAVE_APPLY,
];

export const ROLE_PERMISSIONS: Record<UserRole, PermissionKey[]> = {
  admin: ADMIN_PERMISSIONS,
  teacher: TEACHER_PERMISSIONS,
  parent: PARENT_PERMISSIONS,
};

export function permissionsForRole(role: UserRole): PermissionKey[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function hasPermission(granted: string[], required: PermissionKey): boolean {
  return granted.includes(required);
}
