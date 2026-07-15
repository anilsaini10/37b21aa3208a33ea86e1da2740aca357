/** Teacher's own classes service — real backend (Express + Prisma). Scopes class/section/subject pickers to what this teacher actually teaches or is Class Teacher of. */
import {useQuery} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';
import type {TeacherClassSummary} from '../../shared/types';

export const teacherClassesApi = {
  list: async (): Promise<TeacherClassSummary[]> => {
    try {
      const {data} = await axiosClient.get<TeacherClassSummary[]>(Endpoints.teacher.classes);
      return data;
    } catch (e) {
      console.error('teacherClassesApi.list failed', e);
      rethrowApiError(e, 'Failed to load your classes.');
    }
  },
};

export const useTeacherClasses = () =>
  useQuery({queryKey: ['teacherClasses'], queryFn: teacherClassesApi.list});
