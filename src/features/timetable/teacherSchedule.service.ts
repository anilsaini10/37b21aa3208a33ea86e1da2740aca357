/** Teacher's own schedule — real backend (Express + Prisma). Teacher is always resolved from the JWT, never a client-supplied id. */
import {useQuery} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';
import type {TeacherTodaySchedule, TeacherWeekSchedule} from '../../shared/types';

export const teacherScheduleApi = {
  today: async (): Promise<TeacherTodaySchedule> => {
    try {
      const {data} = await axiosClient.get<TeacherTodaySchedule>(Endpoints.teacher.schedule_today);
      return data;
    } catch (e) {
      console.error('teacherScheduleApi.today failed', e);
      rethrowApiError(e, "Failed to load today's schedule.");
    }
  },

  week: async (): Promise<TeacherWeekSchedule> => {
    try {
      const {data} = await axiosClient.get<TeacherWeekSchedule>(Endpoints.teacher.schedule_week);
      return data;
    } catch (e) {
      console.error('teacherScheduleApi.week failed', e);
      rethrowApiError(e, 'Failed to load your weekly schedule.');
    }
  },
};

export const useTodaySchedule = () =>
  useQuery({queryKey: ['teacherScheduleToday'], queryFn: teacherScheduleApi.today});

export const useWeekSchedule = () =>
  useQuery({queryKey: ['teacherScheduleWeek'], queryFn: teacherScheduleApi.week});
