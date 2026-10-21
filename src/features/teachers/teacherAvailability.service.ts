/**
 * Teacher availability (admin) — real backend.
 *
 * "Who is free 10:00–11:00 on Friday / on 23 Oct?" and per-teacher free/busy timelines.
 * Busy = weekly timetable periods, plus (for a specific date) exam invigilation, approved
 * leave and attendance marked absent / on leave. Only active teachers are included.
 */
import {useQuery} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';
import type {FreeSlotsResponse, ScheduleDay, TeacherAvailabilityResponse} from '../../shared/types';

/** Exactly one of `date` / `day`. Times are "HH:MM", end after start. */
export interface TeacherAvailabilityParams {
  date?: string;
  day?: ScheduleDay;
  startTime: string;
  endTime: string;
  onlyFree?: boolean;
  search?: string;
}

/** Omit `teacherId` for all teachers; omit both `date` and `day` for the whole week (Mon–Sat). */
export interface FreeSlotsParams {
  teacherId?: string;
  date?: string;
  day?: ScheduleDay;
  from?: string;
  to?: string;
  minMinutes?: number;
}

export const teacherAvailabilityApi = {
  availability: async (params: TeacherAvailabilityParams): Promise<TeacherAvailabilityResponse> => {
    try {
      const {data} = await axiosClient.get<TeacherAvailabilityResponse>(Endpoints.admin.teachers_availability, {params});
      return data;
    } catch (e) {
      console.error('teacherAvailabilityApi.availability failed', e);
      rethrowApiError(e, 'Failed to load teacher availability.');
    }
  },

  freeSlots: async (params: FreeSlotsParams): Promise<FreeSlotsResponse> => {
    try {
      const {data} = await axiosClient.get<FreeSlotsResponse>(Endpoints.admin.teachers_freeSlots, {params});
      return data;
    } catch (e) {
      console.error('teacherAvailabilityApi.freeSlots failed', e);
      rethrowApiError(e, 'Failed to load free slots.');
    }
  },
};

export const useTeacherAvailability = (params: TeacherAvailabilityParams | null) =>
  useQuery({
    queryKey: ['teacherAvailability', params],
    queryFn: () => teacherAvailabilityApi.availability(params as TeacherAvailabilityParams),
    enabled: !!params,
  });

export const useTeacherFreeSlots = (params: FreeSlotsParams) =>
  useQuery({queryKey: ['teacherFreeSlots', params], queryFn: () => teacherAvailabilityApi.freeSlots(params)});
