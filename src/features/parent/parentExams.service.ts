/** Parent's view of a child's exams — real backend. Every call is scoped to a specific child (`studentId`), sourced from the active child, never hand-typed or cached across a child switch. */
import {useQuery} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';
import type {ParentExam, ParentExamDetail} from '../../shared/types';

export const parentExamsApi = {
  list: async (studentId: string): Promise<ParentExam[]> => {
    try {
      const {data} = await axiosClient.get<ParentExam[]>(Endpoints.students.exams, {params: {studentId}});
      return data;
    } catch (e) {
      console.error('parentExamsApi.list failed', e);
      rethrowApiError(e, 'Failed to load exams.');
    }
  },

  getById: async (examId: string, studentId: string): Promise<ParentExamDetail> => {
    try {
      const {data} = await axiosClient.get<ParentExamDetail>(Endpoints.students.exams_byId(examId), {
        params: {studentId},
      });
      return data;
    } catch (e) {
      console.error('parentExamsApi.getById failed', e);
      rethrowApiError(e, 'Failed to load exam result.');
    }
  },
};

export const useParentExams = (studentId: string) =>
  useQuery({
    queryKey: ['parentExams', studentId],
    queryFn: () => parentExamsApi.list(studentId),
    enabled: !!studentId,
  });

export const useParentExamDetail = (examId: string, studentId: string) =>
  useQuery({
    queryKey: ['parentExamDetail', examId, studentId],
    queryFn: () => parentExamsApi.getById(examId, studentId),
    enabled: !!examId && !!studentId,
  });
