/**
 * Admin marks/reviews staff (teacher) attendance — real backend (Express + Prisma).
 *
 * Distinct from `teacherAttendance.service.ts` (a teacher marking their own class's
 * students) — this is the admin marking attendance FOR teachers/staff themselves.
 * Each teacher-day holds two independent markings: the teacher's own check-in
 * (teacherStatus) and the admin's (adminStatus); `status` is the final one —
 * the admin's if set, else the teacher's. Admin marking (bulk POST or PATCH) only
 * ever sets the admin side; teachers' check-ins are kept.
 */
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';
import type {AttendanceStatusCode, MarkStaffAttendanceEntry, Paginated, StaffAttendanceRecord} from '../../shared/types';

export interface StaffAttendanceFilters {
  page?: number;
  pageSize?: number;
  date?: string;
  from?: string;
  to?: string;
  /** Filters the FINAL status. */
  status?: AttendanceStatusCode;
  /** Filters the teacher's own check-in status. */
  teacherStatus?: AttendanceStatusCode;
  /** Filters the admin's marking. */
  adminStatus?: AttendanceStatusCode;
  teacherId?: string;
}

export const adminTeacherAttendanceApi = {
  mark: async (date: string, records: MarkStaffAttendanceEntry[]): Promise<{date: string; marked: number}> => {
    try {
      const {data} = await axiosClient.post<{date: string; marked: number}>(Endpoints.admin.teacherAttendance, {
        date,
        records,
      });
      return data;
    } catch (e) {
      console.error('adminTeacherAttendanceApi.mark failed', e);
      rethrowApiError(e, 'Failed to save attendance.');
    }
  },

  list: async (filters: StaffAttendanceFilters): Promise<Paginated<StaffAttendanceRecord>> => {
    try {
      const {data} = await axiosClient.get<Paginated<StaffAttendanceRecord>>(Endpoints.admin.teacherAttendance, {
        params: filters,
      });
      return data;
    } catch (e) {
      console.error('adminTeacherAttendanceApi.list failed', e);
      rethrowApiError(e, 'Failed to load attendance.');
    }
  },

  correct: async (recordId: string, status: AttendanceStatusCode): Promise<StaffAttendanceRecord> => {
    try {
      const {data} = await axiosClient.patch<StaffAttendanceRecord>(
        Endpoints.admin.teacherAttendance_byId(recordId),
        {status},
      );
      return data;
    } catch (e) {
      console.error('adminTeacherAttendanceApi.correct failed', e);
      rethrowApiError(e, 'Failed to update attendance record.');
    }
  },
};

export const useStaffAttendanceList = (filters: StaffAttendanceFilters) =>
  useQuery({
    queryKey: ['staffAttendance', filters],
    queryFn: () => adminTeacherAttendanceApi.list(filters),
  });

export const useMarkStaffAttendance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({date, records}: {date: string; records: MarkStaffAttendanceEntry[]}) =>
      adminTeacherAttendanceApi.mark(date, records),
    onSuccess: () => qc.invalidateQueries({queryKey: ['staffAttendance']}),
  });
};

export const useCorrectStaffAttendance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({recordId, status}: {recordId: string; status: AttendanceStatusCode}) =>
      adminTeacherAttendanceApi.correct(recordId, status),
    onSuccess: () => qc.invalidateQueries({queryKey: ['staffAttendance']}),
  });
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * "Has the admin marked today yet?" — teachers' own check-ins also create records,
 * so a record existing isn't enough; any record with an admin status means it's done.
 */
export const useIsTodayStaffAttendanceMarked = () => {
  const {data, isLoading} = useStaffAttendanceList({date: todayIso(), page: 1, pageSize: 100});
  return {isMarked: (data?.items ?? []).some(r => r.adminStatus != null), isLoading};
};
