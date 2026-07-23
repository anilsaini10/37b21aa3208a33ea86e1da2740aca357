/**
 * Admin marks/reviews staff (teacher) attendance — real backend (Express + Prisma).
 *
 * Distinct from `teacherAttendance.service.ts` (a teacher marking their own class's
 * students) — this is the admin marking attendance FOR teachers/staff themselves.
 * Marking is a bulk upsert: one call per day covers every teacher, and re-submitting
 * the same teacher+date just overwrites the previous status.
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
  status?: AttendanceStatusCode;
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

/** Cheap proxy for "has today's bulk mark already happened" — the mark screen always submits every teacher's status in one shot, so any record for today means it's done. */
export const useIsTodayStaffAttendanceMarked = () => {
  const {data, isLoading} = useStaffAttendanceList({date: todayIso(), page: 1, pageSize: 1});
  return {isMarked: (data?.total ?? 0) > 0, isLoading};
};
