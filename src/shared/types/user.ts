import type {ID, Status} from './common';

export type UserRole = 'admin' | 'teacher' | 'parent';

export interface BaseUser {
  id: ID;
  name: string;
  email?: string;
  phone: string;
  avatarUrl?: string;
  role: UserRole;
  status: Status;
  createdAt: string;
}

export interface AuthUser extends BaseUser {
  schoolId: ID;
  schoolName: string;
  /** Permission keys granted to this user (RBAC). */
  permissions: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface AuthSession {
  user: AuthUser;
  tokens: AuthTokens;
}

export type Gender = 'male' | 'female' | 'other';

export interface Student {
  id: ID;
  admissionNo: string;
  name: string;
  gender: Gender;
  dateOfBirth: string;
  classId: ID;
  className: string;
  sectionId: ID;
  sectionName: string;
  rollNo: number;
  parentId: ID;
  parentName: string;
  parentPhone: string;
  avatarUrl?: string;
  bloodGroup?: string;
  address?: string;
  status: Status;
  attendancePercentage: number;
  documents: StudentDocument[];
}

export interface StudentDocument {
  id: ID;
  title: string;
  type: 'birth_certificate' | 'aadhaar' | 'report_card' | 'photo' | 'other';
  uri: string;
  uploadedAt: string;
}

export interface Teacher {
  id: ID;
  employeeId: string;
  name: string;
  gender: Gender;
  email: string;
  phone: string;
  subjectIds: ID[];
  subjects: string[];
  classTeacherOf?: string;
  avatarUrl?: string;
  joiningDate: string;
  salary: number;
  status: Status;
  performanceScore: number;
}

export interface Parent {
  id: ID;
  name: string;
  phone: string;
  email?: string;
  childIds: ID[];
  address?: string;
  occupation?: string;
}

export interface Staff {
  id: ID;
  name: string;
  role: string;
  phone: string;
  department: string;
  salary: number;
  status: Status;
}
