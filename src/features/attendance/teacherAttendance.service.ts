/**
 * Teacher attendance service — real backend (Express + Prisma).
 *
 * Only the Class Teacher of a section can mark/view/correct its attendance —
 * the backend enforces this and returns 403 NOT_CLASS_TEACHER otherwise; the
 * UI just surfaces that message gracefully rather than gating client-side.
 */
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';
import type {
  AttendanceStatusCode,
  MarkAttendanceEntry,
  SectionAttendance,
  StudentAttendanceHistory,
} from '../../shared/types';

export const teacherAttendanceApi = {
  /** Section roster + each student's current status for a date — pre-fills the marking screen. */
  sectionAttendance: async (sectionId: string, date: string): Promise<SectionAttendance> => {
    try {
      const {data} = await axiosClient.get<SectionAttendance>(Endpoints.teacher.attendance, {
        params: {sectionId, date},
      });
      return data;
    } catch (e) {
      console.error('teacherAttendanceApi.sectionAttendance failed', e);
      rethrowApiError(e, 'Failed to load attendance.');
    }
  },

  /** Bulk upsert — resubmitting a studentId+date simply overwrites the previous status. */
  markBulk: async (sectionId: string, date: string, records: MarkAttendanceEntry[]): Promise<{marked: number}> => {
    try {
      const {data} = await axiosClient.post<{marked: number}>(Endpoints.teacher.attendance, {
        sectionId,
        date,
        records,
      });
      return data;
    } catch (e) {
      console.error('teacherAttendanceApi.markBulk failed', e);
      rethrowApiError(e, 'Failed to save attendance.');
    }
  },

  studentHistory: async (studentId: string, from?: string, to?: string): Promise<StudentAttendanceHistory> => {
    try {
      const {data} = await axiosClient.get<StudentAttendanceHistory>(
        Endpoints.teacher.attendance_studentHistory(studentId),
        {params: {from, to}},
      );
      return data;
    } catch (e) {
      console.error('teacherAttendanceApi.studentHistory failed', e);
      rethrowApiError(e, 'Failed to load attendance history.');
    }
  },

  /** Correct one past record in place — used from the History screen instead of a whole bulk re-submit. */
  correctRecord: async (
    recordId: string,
    status: AttendanceStatusCode,
  ): Promise<{id: string; studentId: string; date: string; status: string}> => {
    try {
      const {data} = await axiosClient.patch(Endpoints.teacher.attendance_byId(recordId), {status});
      return data;
    } catch (e) {
      console.error('teacherAttendanceApi.correctRecord failed', e);
      rethrowApiError(e, 'Failed to update attendance record.');
    }
  },
};

export const useSectionAttendance = (sectionId: string, date: string) =>
  useQuery({
    queryKey: ['teacherAttendance', 'section', sectionId, date],
    queryFn: () => teacherAttendanceApi.sectionAttendance(sectionId, date),
    enabled: !!sectionId && !!date,
  });

export const useMarkSectionAttendance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({sectionId, date, records}: {sectionId: string; date: string; records: MarkAttendanceEntry[]}) =>
      teacherAttendanceApi.markBulk(sectionId, date, records),
    onSuccess: (_data, {sectionId, date}) => {
      qc.invalidateQueries({queryKey: ['teacherAttendance', 'section', sectionId, date]});
    },
  });
};

export const useStudentAttendanceHistory = (studentId: string, from?: string, to?: string) =>
  useQuery({
    queryKey: ['teacherAttendance', 'history', studentId, from, to],
    queryFn: () => teacherAttendanceApi.studentHistory(studentId, from, to),
    enabled: !!studentId,
  });

export const useCorrectAttendanceRecord = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({recordId, status}: {recordId: string; status: AttendanceStatusCode}) =>
      teacherAttendanceApi.correctRecord(recordId, status),
    onSuccess: () => qc.invalidateQueries({queryKey: ['teacherAttendance', 'history']}),
  });
};
