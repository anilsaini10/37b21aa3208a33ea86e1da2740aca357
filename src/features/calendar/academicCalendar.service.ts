/**
 * Academic calendar — real backend.
 *
 * Admin: read from `/api/admin/academic-calendar` (events + exams merged, with working-day
 * counts); entries are created / edited through the Events API, plus the Excel bulk import
 * (dry run → import) below.
 *
 * Teacher / Parent: read-only — `useRoleAcademicCalendar` picks `/api/teacher/academic-calendar`
 * or `/api/students/academic-calendar?studentId=` by the logged-in role. Same response shape;
 * the backend already filters entries per role (and per child's class for parents).
 */
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {extractErrorStatus, rethrowApiError} from '../../core/api/apiError';
import {useAuthStore} from '../auth/authStore';
import type {AcademicCalendarResponse, CalendarImportResponse, CalendarImportRow, EventType} from '../../shared/types';

/** Either a session (`year` → e.g. 2026-27), a custom `from`/`to` range (max 400 days), or nothing (current session). */
export interface AcademicCalendarParams {
  year?: number;
  from?: string;
  to?: string;
  eventType?: EventType;
}

/** Most rows one import request may carry. */
export const CALENDAR_IMPORT_MAX_ROWS = 500;

export const academicCalendarApi = {
  get: async (params: AcademicCalendarParams): Promise<AcademicCalendarResponse> => {
    try {
      const {data} = await axiosClient.get<AcademicCalendarResponse>(Endpoints.admin.academicCalendar, {params});
      return data;
    } catch (e) {
      console.error('academicCalendarApi.get failed', e);
      rethrowApiError(e, 'Failed to load the academic calendar.');
    }
  },

  /** Teacher / parent view. `studentId` is required for parents. */
  getForRole: async (
    role: 'teacher' | 'parent',
    params: {year?: number; studentId?: string},
  ): Promise<AcademicCalendarResponse> => {
    try {
      const url = role === 'teacher' ? Endpoints.teacher.academicCalendar : Endpoints.students.academicCalendar;
      const {data} = await axiosClient.get<AcademicCalendarResponse>(url, {
        params: role === 'teacher' ? {year: params.year} : params,
      });
      return data;
    } catch (e) {
      console.error('academicCalendarApi.getForRole failed', e);
      rethrowApiError(e, 'Failed to load the academic calendar.');
    }
  },

  /** `dryRun` validates every row and saves nothing; otherwise all rows are created, or none if any is invalid. */
  importRows: async (rows: CalendarImportRow[], dryRun: boolean): Promise<CalendarImportResponse> => {
    try {
      const {data} = await axiosClient.post<CalendarImportResponse>(Endpoints.admin.events, rows, {
        params: dryRun ? {dryRun: true} : undefined,
      });
      return data;
    } catch (e) {
      console.error('academicCalendarApi.importRows failed', e);
      rethrowApiError(e, 'Failed to import the calendar.');
    }
  },
};

export const useAcademicCalendar = (params: AcademicCalendarParams) =>
  useQuery({queryKey: ['academicCalendar', params], queryFn: () => academicCalendarApi.get(params)});

/**
 * Teacher / parent academic calendar — endpoint chosen by the logged-in role. Cached per
 * session `year` (undefined = current session) and per `studentId`. Parents without a
 * `studentId` don't fetch. 4xx errors (NOT_YOUR_CHILD, VALIDATION_ERROR) aren't retried.
 */
export function useRoleAcademicCalendar({year, studentId}: {year?: number; studentId?: string}) {
  const role = useAuthStore(s => s.user?.role);
  const viewerRole = role === 'parent' ? 'parent' : 'teacher';
  return useQuery({
    queryKey: ['academicCalendar', viewerRole, year ?? 'current', studentId ?? null],
    queryFn: () => academicCalendarApi.getForRole(viewerRole, {year, studentId}),
    enabled: viewerRole === 'teacher' || !!studentId,
    retry: (count, e) => {
      const status = extractErrorStatus(e);
      return (status === undefined || status === 0 || status >= 500) && count < 2;
    },
  });
}

export const useValidateCalendarImport = () =>
  useMutation({mutationFn: (rows: CalendarImportRow[]) => academicCalendarApi.importRows(rows, true)});

export const useCalendarImport = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rows: CalendarImportRow[]) => academicCalendarApi.importRows(rows, false),
    onSuccess: () => {
      qc.invalidateQueries({queryKey: ['academicCalendar']});
      qc.invalidateQueries({queryKey: ['adminEvents']});
    },
  });
};
