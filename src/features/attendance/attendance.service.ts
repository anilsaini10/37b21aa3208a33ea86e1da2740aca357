/** Attendance service (mock) — admin teacher/student range reports + hooks. */
import {useQuery} from '@tanstack/react-query';
import {db} from '../../core/mock/db';
import {respond} from '../../core/mock/mockApi';
import {groupBy} from '../../core/utils/misc';
import type {
  AttendanceCounts,
  AttendanceRangeSummary,
  AttendanceStatus,
  ClassAttendanceSummary,
  StudentAttendanceBreakdown,
  TeacherAttendanceBreakdown,
} from '../../shared/types';

/** The mock dataset's anchor "today" — a sensible default date for the report screen. */
export const attendanceToday = db.today;

function countByStatus(records: {status: AttendanceStatus}[]): AttendanceCounts {
  const present = records.filter(r => r.status === 'present').length;
  const absent = records.filter(r => r.status === 'absent').length;
  const late = records.filter(r => r.status === 'late').length;
  const leave = records.filter(r => r.status === 'leave').length;
  const total = records.length;
  return {present, absent, late, leave, total, percentage: total ? Math.round((present / total) * 100) : 0};
}

function inRange(date: string, fromDate: string, toDate: string): boolean {
  return date >= fromDate && date <= toDate;
}

export const attendanceApi = {
  /** Teacher attendance, aggregated across a date range. */
  teacherRangeSummary: (fromDate: string, toDate: string): Promise<AttendanceRangeSummary> => {
    const records = db.teacherAttendanceRecords.filter(r => inRange(r.date, fromDate, toDate));
    return respond({fromDate, toDate, ...countByStatus(records)});
  },

  /** Every teacher's attendance breakdown across a date range — feeds the Teacher tab's list. */
  teacherList: (fromDate: string, toDate: string): Promise<TeacherAttendanceBreakdown[]> => {
    const records = db.teacherAttendanceRecords.filter(r => inRange(r.date, fromDate, toDate));
    const byTeacher = groupBy(records, r => r.teacherId);
    const rows = Object.entries(byTeacher).map(([teacherId, entries]) => ({
      teacherId,
      teacherName: entries[0].teacherName,
      ...countByStatus(entries),
    }));
    return respond(rows.sort((a, b) => a.teacherName.localeCompare(b.teacherName)));
  },

  /** One row per class with attendance counts across a date range — feeds the Students tab's class list. */
  classSummaries: (fromDate: string, toDate: string): Promise<ClassAttendanceSummary[]> => {
    const records = db.attendanceRecords.filter(r => inRange(r.date, fromDate, toDate));
    const byClass = groupBy(records, r => r.classId);
    const rows = db.classes.map(cls => ({
      classId: cls.id,
      className: cls.name,
      ...countByStatus(byClass[cls.id] ?? []),
    }));
    return respond(rows);
  },

  /** Every student in one class with their attendance breakdown across a date range. */
  classStudents: (fromDate: string, toDate: string, classId: string): Promise<StudentAttendanceBreakdown[]> => {
    const records = db.attendanceRecords.filter(r => inRange(r.date, fromDate, toDate) && r.classId === classId);
    const byStudent = groupBy(records, r => r.studentId);
    const rows = Object.entries(byStudent).map(([studentId, entries]) => {
      const student = db.students.find(s => s.id === studentId);
      return {
        studentId,
        studentName: entries[0].studentName,
        rollNo: student?.rollNo ?? 0,
        sectionName: student?.sectionName ?? '',
        ...countByStatus(entries),
      };
    });
    return respond(rows.sort((a, b) => a.rollNo - b.rollNo));
  },
};

export const useTeacherRangeSummary = (fromDate: string, toDate: string) =>
  useQuery({
    queryKey: ['attendance', 'teacherRangeSummary', fromDate, toDate],
    queryFn: () => attendanceApi.teacherRangeSummary(fromDate, toDate),
    enabled: !!fromDate && !!toDate,
  });

export const useTeacherAttendanceList = (fromDate: string, toDate: string) =>
  useQuery({
    queryKey: ['attendance', 'teacherList', fromDate, toDate],
    queryFn: () => attendanceApi.teacherList(fromDate, toDate),
    enabled: !!fromDate && !!toDate,
  });

export const useClassAttendanceSummaries = (fromDate: string, toDate: string) =>
  useQuery({
    queryKey: ['attendance', 'classSummaries', fromDate, toDate],
    queryFn: () => attendanceApi.classSummaries(fromDate, toDate),
    enabled: !!fromDate && !!toDate,
  });

export const useClassStudentsAttendance = (fromDate: string, toDate: string, classId: string) =>
  useQuery({
    queryKey: ['attendance', 'classStudents', fromDate, toDate, classId],
    queryFn: () => attendanceApi.classStudents(fromDate, toDate, classId),
    enabled: !!fromDate && !!toDate && !!classId,
  });
