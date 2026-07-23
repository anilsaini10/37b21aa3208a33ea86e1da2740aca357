import type {ID} from './common';

// ---- Leave requests (real backend, /api/students|teacher|admin/leave) -----
// Same object shape everywhere it appears (parent/teacher/admin views).
// A parent applies for their child's leave; the child's Class Teacher or an
// admin approves/rejects it; on approval the backend auto-marks attendance as
// LEAVE for every date in the range — nothing further to call from the app.

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Leave {
  id: ID;
  studentId: ID;
  studentName: string;
  classId: ID;
  className: string;
  sectionId: ID;
  sectionName: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: LeaveStatus;
  appliedBy: {id: ID; name: string};
  reviewedBy: {id: ID; name: string} | null;
  reviewedAt: string | null;
  reviewRemarks: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApplyLeaveInput {
  studentId: string;
  fromDate: string;
  toDate: string;
  reason: string;
}

export interface ReviewLeaveInput {
  status: Extract<LeaveStatus, 'APPROVED' | 'REJECTED'>;
  reviewRemarks?: string;
}

// ---- Teacher's own leave (real backend, /api/teacher/my-leave, /api/admin/leave/teachers) -----
// Separate feature from student leave above — a teacher applying for their own
// leave, reviewed by an admin. No attendance auto-marking: staff attendance
// isn't tracked in this system.

export interface TeacherLeave {
  id: ID;
  teacherId: ID;
  teacherName: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: LeaveStatus;
  reviewedBy: {id: ID; name: string} | null;
  reviewedAt: string | null;
  reviewRemarks: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Teacher's own leave, from `/api/teacher/my-leave` — identical shape minus teacherId/teacherName (always themselves). */
export type MyLeave = Omit<TeacherLeave, 'teacherId' | 'teacherName'>;

export interface ApplyTeacherLeaveInput {
  fromDate: string;
  toDate: string;
  reason: string;
}
