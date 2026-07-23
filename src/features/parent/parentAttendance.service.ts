/** Parent's view of a child's attendance history — real backend. Every call is scoped to a specific child (`studentId`), sourced from the active child, never hand-typed or cached across a child switch. */
import {useQuery} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';
import type {StudentAttendanceHistory} from '../../shared/types';

export const parentAttendanceApi = {
  history: async (studentId: string, from?: string, to?: string): Promise<StudentAttendanceHistory> => {
    try {
      const {data} = await axiosClient.get<StudentAttendanceHistory>(Endpoints.students.attendance, {
        params: {studentId, from, to},
      });
      return data;
    } catch (e) {
      console.error('parentAttendanceApi.history failed', e);
      rethrowApiError(e, 'Failed to load attendance history.');
    }
  },
};

export const useParentAttendance = (studentId: string, from?: string, to?: string) =>
  useQuery({
    queryKey: ['parentAttendance', studentId, from, to],
    queryFn: () => parentAttendanceApi.history(studentId, from, to),
    enabled: !!studentId,
  });
