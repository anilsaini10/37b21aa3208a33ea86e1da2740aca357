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
  parentEmail: string;
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

// ---- Parent's own profile (real backend, /api/students/profile) -----------
// Read-only for the child, self-editable for the parent. No parent/document
// fields on the child — the parent already knows who they are.

export interface ParentChild {
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
  bloodGroup?: string;
  address?: string;
  status: Status;
  attendancePercentage: number;
}

export interface ParentSelfProfile {
  id: ID;
  name: string;
  email: string;
  phone: string;
}

export interface Teacher {
  id: ID;
  employeeId: string;
  name: string;
  gender: Gender;
  email: string;
  phone: string;
  /** Each entry is one subject taught in one class — a teacher may teach the same or different subjects across multiple classes. Empty until assigned via a separate subject+class call, even right after creation. */
  subjects: TeacherSubjectAssignment[];
  /** Section(s) where this teacher is the Class Teacher (homeroom in-charge) — in practice at most one. */
  classTeacherOf: TeacherHomeroomSection[];
  avatarUrl?: string;
  joiningDate: string;
  salary: number;
  status: Status;
  performanceScore: number;
  qualification: string;
  experienceYears: number;
  experienceMonths: number;
  /** General subject expertise from the create form — names only, not tied to any class (distinct from `subjects` above). */
  subjectsTaught: string[];
}

export interface TeacherSubjectAssignment {
  subjectId: ID;
  name: string;
  classId: ID;
  className: string;
}

export interface TeacherHomeroomSection {
  sectionId: ID;
  sectionName: string;
  classId: ID;
  className: string;
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

// ---- Non-teaching staff (real backend, /api/admin/staff) -------------------
// A plain HR/directory record — no login, no password, no auth flow.

export interface Staff {
  id: ID;
  employeeId: string;
  name: string;
  /** Many support staff won't have one. */
  email?: string;
  phone: string;
  gender: Gender;
  /** Free text — e.g. "Accountant", "Librarian", "Driver", "Peon", "Receptionist", or anything the admin types. */
  designation: string;
  salary: number;
  qualification: string;
  experienceYears: number;
  experienceMonths: number;
  joiningDate: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
}
