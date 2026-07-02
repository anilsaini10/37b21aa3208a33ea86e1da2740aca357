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

export interface DailyAttendanceSummary {
  date: string;
  present: number;
  absent: number;
  late: number;
  leave: number;
  total: number;
  percentage: number;
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
