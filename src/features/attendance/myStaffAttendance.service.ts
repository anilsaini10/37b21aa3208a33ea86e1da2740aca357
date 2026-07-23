/** Teacher's own staff-attendance history — real backend. Read-only: marking/correcting is admin-only, done from the admin's Attendance Register instead. */
import {useQuery} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';
import type {AttendanceStatusCode, MyStaffAttendanceRecord, Paginated} from '../../shared/types';

export interface MyAttendanceFilters {
  page?: number;
  pageSize?: number;
  date?: string;
  from?: string;
  to?: string;
  status?: AttendanceStatusCode;
}

export const myAttendanceApi = {
  list: async (filters: MyAttendanceFilters): Promise<Paginated<MyStaffAttendanceRecord>> => {
    try {
      const {data} = await axiosClient.get<Paginated<MyStaffAttendanceRecord>>(Endpoints.teacher.myAttendance, {
        params: filters,
      });
      return data;
    } catch (e) {
      console.error('myAttendanceApi.list failed', e);
      rethrowApiError(e, 'Failed to load your attendance.');
    }
  },
};

export const useMyAttendance = (filters: MyAttendanceFilters) =>
  useQuery({queryKey: ['myAttendance', filters], queryFn: () => myAttendanceApi.list(filters)});
