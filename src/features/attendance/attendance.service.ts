/** Attendance service — mark/list student + teacher attendance, daily summaries + hooks. */
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {db} from '../../core/mock/db';
import {respond} from '../../core/mock/mockApi';
import {generateId} from '../../core/utils/misc';
import type {
  AttendanceRecord,
  AttendanceStatus,
  DailyAttendanceSummary,
  Student,
} from '../../shared/types';

/** The mock dataset's anchor "today" — a sensible default date for the report screen. */
export const attendanceToday = db.today;

function summarise(records: {status: AttendanceStatus}[], date: string): DailyAttendanceSummary {
  const present = records.filter(r => r.status === 'present').length;
  const absent = records.filter(r => r.status === 'absent').length;
  const late = records.filter(r => r.status === 'late').length;
  const leave = records.filter(r => r.status === 'leave').length;
  const total = records.length || 1;
  return {
    date,
    present,
    absent,
    late,
    leave,
    total: records.length,
    percentage: Math.round((present / total) * 100),
  };
}

export const attendanceApi = {
  studentsForClass: (classId: string, sectionId: string): Promise<Student[]> =>
    respond(db.students.filter(s => s.classId === classId && s.sectionId === sectionId)),

  markBulk: (
    date: string,
    entries: {studentId: string; status: AttendanceStatus}[],
  ): Promise<{saved: number}> => {
    entries.forEach(entry => {
      const student = db.students.find(s => s.id === entry.studentId);
      const record: AttendanceRecord = {
        id: generateId('att'),
        date,
        studentId: entry.studentId,
        studentName: student?.name ?? '',
        classId: student?.classId ?? '',
        sectionId: student?.sectionId ?? '',
        status: entry.status,
      };
      db.attendanceRecords.push(record);
    });
    return respond({saved: entries.length});
  },

  /** Student attendance summary for one specific date (defaults to "today" in the mock dataset). */
  summary: (date: string = db.today, classId?: string): Promise<DailyAttendanceSummary> => {
    const records = db.attendanceRecords.filter(
      r => r.date === date && (!classId || r.classId === classId),
    );
    return respond(summarise(records, date));
  },

  /** Teacher attendance summary for one specific date. */
  teacherSummary: (date: string = db.today): Promise<DailyAttendanceSummary> => {
    const records = db.teacherAttendanceRecords.filter(r => r.date === date);
    return respond(summarise(records, date));
  },

  history: (studentId: string): Promise<AttendanceRecord[]> =>
    respond(db.attendanceRecords.filter(r => r.studentId === studentId)),
};

export const useAttendanceStudents = (classId: string, sectionId: string) =>
  useQuery({
    queryKey: ['attendance', 'students', classId, sectionId],
    queryFn: () => attendanceApi.studentsForClass(classId, sectionId),
    enabled: !!classId && !!sectionId,
  });

export const useAttendanceSummary = (date?: string, classId?: string) =>
  useQuery({
    queryKey: ['attendance', 'summary', date, classId],
    queryFn: () => attendanceApi.summary(date, classId),
  });

export const useTeacherAttendanceSummary = (date?: string) =>
  useQuery({
    queryKey: ['attendance', 'teacherSummary', date],
    queryFn: () => attendanceApi.teacherSummary(date),
  });

export const useMarkAttendance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({date, entries}: {date: string; entries: {studentId: string; status: AttendanceStatus}[]}) =>
      attendanceApi.markBulk(date, entries),
    onSuccess: () => qc.invalidateQueries({queryKey: ['attendance']}),
  });
};
