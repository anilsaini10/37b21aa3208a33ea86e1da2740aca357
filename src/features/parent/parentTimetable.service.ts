/** Parent's view of a child's weekly timetable — real backend. Every call is scoped to a specific child (`studentId`), sourced from the active child, never hand-typed or cached across a child switch. */
import {useQuery} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';
import type {ChildTimetable} from '../../shared/types';

export const parentTimetableApi = {
  get: async (studentId: string): Promise<ChildTimetable> => {
    try {
      const {data} = await axiosClient.get<ChildTimetable>(Endpoints.students.timetable, {params: {studentId}});
      return data;
    } catch (e) {
      console.error('parentTimetableApi.get failed', e);
      rethrowApiError(e, 'Failed to load timetable.');
    }
  },
};

export const useParentTimetable = (studentId: string) =>
  useQuery({
    queryKey: ['parentTimetable', studentId],
    queryFn: () => parentTimetableApi.get(studentId),
    enabled: !!studentId,
  });
