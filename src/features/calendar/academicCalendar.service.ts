/**
 * Academic calendar (admin) — real backend.
 *
 * The calendar is read from `/api/admin/academic-calendar` (events + exams merged, with
 * working-day counts). Entries are created / edited through the Events API; this service
 * adds the Excel bulk import (dry run → import) on top of it.
 */
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';
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
