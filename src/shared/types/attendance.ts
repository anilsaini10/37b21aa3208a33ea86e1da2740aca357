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

/** One class's aggregated attendance across a date range — feeds the Students tab's class list. */
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
