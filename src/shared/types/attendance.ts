import type {ID} from './common';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave' | 'holiday';

export interface AttendanceRecord {
  id: ID;
  date: string;
  studentId: ID;
  studentName: string;
  classId: ID;
  sectionId: ID;
  status: AttendanceStatus;
  markedByTeacherId?: ID;
  remark?: string;
}

/** Plain status-count breakdown — the common shape every range aggregate builds on. */
export interface AttendanceCounts {
  present: number;
  absent: number;
  late: number;
  leave: number;
  total: number;
  percentage: number;
}

/** Attendance counts across a date range (used for the Teacher tab's overall tiles). */
export interface AttendanceRangeSummary extends AttendanceCounts {
  fromDate: string;
  toDate: string;
}

/** One teacher's attendance breakdown across a date range — feeds the Teacher tab's list. */
export interface TeacherAttendanceBreakdown extends AttendanceCounts {
  teacherId: ID;
  teacherName: string;
}

/** One class's aggregated attendance for a chosen day — feeds the admin Students tab's class list (`GET /api/admin/attendance/classes`). */
export interface ClassAttendanceSummary extends AttendanceCounts {
  classId: ID;
  className: string;
}

/** One student's attendance breakdown across a date range — feeds the class drill-down list. */
export interface StudentAttendanceBreakdown extends AttendanceCounts {
  studentId: ID;
  studentName: string;
  rollNo: number;
  sectionName: string;
}

export interface TeacherAttendanceRecord {
  id: ID;
  date: string;
  teacherId: ID;
  teacherName: string;
  status: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
}

export interface MonthlyAttendance {
  month: string;
  present: number;
  absent: number;
  percentage: number;
  daily: {date: string; status: AttendanceStatus}[];
}

// ---- Teacher attendance (real backend, /api/teacher/attendance) ------------
// Uppercase status codes — distinct from the mock lowercase `AttendanceStatus`
// used by the admin report screens above.

export type AttendanceStatusCode = 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE' | 'HOLIDAY';

/** One student row in the section marking screen — `recordId`/`status` are null until marked. */
export interface SectionAttendanceStudent {
  studentId: ID;
  name: string;
  admissionNo: string;
  rollNo: number;
  recordId: ID | null;
  status: AttendanceStatusCode | null;
}

export interface SectionAttendance {
  date: string;
  sectionId: ID;
  students: SectionAttendanceStudent[];
}

export interface MarkAttendanceEntry {
  studentId: ID;
  status: AttendanceStatusCode;
}

export interface StudentAttendanceHistoryRecord {
  id: ID;
  date: string;
  status: AttendanceStatusCode;
}

export interface StudentAttendanceHistorySummary {
  present: number;
  absent: number;
  late: number;
  leave: number;
  holiday: number;
}

export interface StudentAttendanceHistory {
  studentId: ID;
  name: string;
  admissionNo: string;
  className: string;
  sectionName: string;
  from: string;
  to: string;
  records: StudentAttendanceHistoryRecord[];
  summary: StudentAttendanceHistorySummary;
}

// ---- Admin-marked staff attendance (real backend, /api/admin/teacher-attendance) ----
// Admin marks attendance FOR teachers/staff themselves — distinct from a teacher
// marking their own class's students. Named `StaffAttendance*` to avoid colliding
// with the mock `TeacherAttendanceRecord`/`TeacherAttendanceBreakdown` above.

export interface StaffAttendanceRecord {
  id: ID;
  teacherId: ID;
  teacherName: string;
  employeeId: string;
  date: string;
  status: AttendanceStatusCode;
  markedBy: {id: ID; name: string};
  createdAt: string;
  updatedAt: string;
}

/** Teacher's own view of the same records, from `/api/teacher/my-attendance` — teacherId/teacherName/employeeId omitted since it's always themselves. Read-only. */
export type MyStaffAttendanceRecord = Omit<StaffAttendanceRecord, 'teacherId' | 'teacherName' | 'employeeId'>;

export interface MarkStaffAttendanceEntry {
  teacherId: ID;
  status: AttendanceStatusCode;
}

// ---- Admin read-only student attendance (real backend, /api/admin/attendance) ----
// Admin's day-by-day view of student attendance across classes — read-only, marking
// stays the class teacher's job via /api/teacher/attendance.

/** One student's status for the day in a class drill-down — `status` is null when that student hasn't been marked yet (distinct from absent). */
export interface ClassAttendanceStudentStatus {
  studentId: ID;
  name: string;
  admissionNo: string;
  rollNo: number;
  sectionName: string;
  status: AttendanceStatusCode | null;
}

export interface ClassAttendanceStudentsResponse {
  date: string;
  classId: ID;
  className: string;
  items: ClassAttendanceStudentStatus[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
