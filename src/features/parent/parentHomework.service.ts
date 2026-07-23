/** Parent's view of a child's homework — real backend. Every call is scoped to a specific child (`studentId`), sourced from the active child. Read-only: no submission/upload flow exists here. */
import {useQuery} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';
import type {Paginated, ParentHomeworkItem} from '../../shared/types';

export interface ParentHomeworkParams {
  studentId: string;
  subjectId?: string;
  page?: number;
  pageSize?: number;
}

export const parentHomeworkApi = {
  list: async (params: ParentHomeworkParams): Promise<Paginated<ParentHomeworkItem>> => {
    try {
      const {data} = await axiosClient.get<Paginated<ParentHomeworkItem>>(Endpoints.students.homework, {params});
      return data;
    } catch (e) {
      console.error('parentHomeworkApi.list failed', e);
      rethrowApiError(e, 'Failed to load homework.');
    }
  },

  getById: async (homeworkId: string, studentId: string): Promise<ParentHomeworkItem> => {
    try {
      const {data} = await axiosClient.get<ParentHomeworkItem>(Endpoints.students.homework_byId(homeworkId), {
        params: {studentId},
      });
      return data;
    } catch (e) {
      console.error('parentHomeworkApi.getById failed', e);
      rethrowApiError(e, 'Failed to load homework.');
    }
  },
};

export const useParentHomeworkList = (params: ParentHomeworkParams) =>
  useQuery({
    queryKey: ['parentHomework', params],
    queryFn: () => parentHomeworkApi.list(params),
    enabled: !!params.studentId,
  });

/** `initial` (the tapped list row) renders instantly in the detail modal while a fresh copy refetches in the background. */
export const useParentHomeworkItem = (homeworkId: string, studentId: string, initial?: ParentHomeworkItem) =>
  useQuery({
    queryKey: ['parentHomeworkItem', homeworkId, studentId],
    queryFn: () => parentHomeworkApi.getById(homeworkId, studentId),
    enabled: !!homeworkId && !!studentId,
    initialData: initial,
  });
