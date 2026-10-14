/**
 * Teacher's own staff attendance — real backend.
 *
 * History is read-only (corrections are admin-only, from the Attendance Register).
 * The writes are today's self check-in (recorded as PRESENT) and check-out, each with
 * its time and optional GPS location; "today" is decided by the server in IST, the app never sends a date.
 */
import {useEffect} from 'react';
import {AppState} from 'react-native';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';
import type {Coordinates} from '../../core/location/locationService';
import type {AttendanceStatusCode, MyAttendanceToday, MyStaffAttendanceRecord, Paginated} from '../../shared/types';

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

  today: async (): Promise<MyAttendanceToday> => {
    try {
      const {data} = await axiosClient.get<MyAttendanceToday>(Endpoints.teacher.myAttendanceToday);
      return data;
    } catch (e) {
      console.error('myAttendanceApi.today failed', e);
      rethrowApiError(e, "Failed to load today's attendance.");
    }
  },

  /** `location` is optional on the server — sent as `{latitude, longitude}` when we have it, else `{}`. */
  checkIn: async (location?: Coordinates | null): Promise<{message: string; record: MyStaffAttendanceRecord}> => {
    try {
      const {data} = await axiosClient.post<{message: string; record: MyStaffAttendanceRecord}>(
        Endpoints.teacher.myAttendanceCheckIn,
        location ? {latitude: location.latitude, longitude: location.longitude} : {},
      );
      return data;
    } catch (e) {
      console.error('myAttendanceApi.checkIn failed', e);
      rethrowApiError(e, "Couldn't mark attendance. Try again.");
    }
  },

  /** Same optional `{latitude, longitude}` body as check-in. Only after today's own check-in, and only once. */
  checkOut: async (location?: Coordinates | null): Promise<{message: string; record: MyStaffAttendanceRecord}> => {
    try {
      const {data} = await axiosClient.post<{message: string; record: MyStaffAttendanceRecord}>(
        Endpoints.teacher.myAttendanceCheckOut,
        location ? {latitude: location.latitude, longitude: location.longitude} : {},
      );
      return data;
    } catch (e) {
      console.error('myAttendanceApi.checkOut failed', e);
      rethrowApiError(e, "Couldn't update attendance. Try again.");
    }
  },
};

export const useMyAttendance = (filters: MyAttendanceFilters) =>
  useQuery({queryKey: ['myAttendance', filters], queryFn: () => myAttendanceApi.list(filters)});

export const MY_ATTENDANCE_TODAY_KEY = ['myAttendanceToday'] as const;

/**
 * Today's check-in state. Never cached as fresh (`staleTime: 0`) and refetched when
 * the app returns to the foreground — the day rolls over at IST midnight, so
 * "checked in" must always come from the server.
 */
export const useMyAttendanceToday = () => {
  const query = useQuery({queryKey: MY_ATTENDANCE_TODAY_KEY, queryFn: myAttendanceApi.today, staleTime: 0});
  const {refetch} = query;
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        refetch();
      }
    });
    return () => sub.remove();
  }, [refetch]);
  return query;
};

export const useCheckIn = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (location?: Coordinates | null) => myAttendanceApi.checkIn(location),
    onSuccess: () => {
      qc.invalidateQueries({queryKey: MY_ATTENDANCE_TODAY_KEY});
      qc.invalidateQueries({queryKey: ['myAttendance']});
    },
  });
};

export const useCheckOut = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (location?: Coordinates | null) => myAttendanceApi.checkOut(location),
    onSuccess: () => {
      qc.invalidateQueries({queryKey: MY_ATTENDANCE_TODAY_KEY});
      qc.invalidateQueries({queryKey: ['myAttendance']});
    },
  });
};
