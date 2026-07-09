/** Subjects service — real backend (Express + Prisma), scoped server-side to the admin's school. */
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';
import type {Subject} from '../../shared/types';

export interface CreateSubjectInput {
  name: string;
  /** Optional — immediately links the new subject into these classes' curricula. */
  classIds?: string[];
}

export const subjectsApi = {
  list: async (): Promise<Subject[]> => {
    try {
      const {data} = await axiosClient.get<Subject[]>(Endpoints.subjects.list);
      return data;
    } catch (e) {
      rethrowApiError(e, 'Failed to load subjects.');
    }
  },

  create: async (input: CreateSubjectInput): Promise<Subject> => {
    try {
      const {data} = await axiosClient.post<Subject>(Endpoints.subjects.create, input);
      return data;
    } catch (e) {
      rethrowApiError(e, 'Failed to create subject.');
    }
  },
};

export const useSubjects = () => useQuery({queryKey: ['subjects'], queryFn: subjectsApi.list});

export const useCreateSubject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSubjectInput) => subjectsApi.create(input),
    onSuccess: () => {
      qc.invalidateQueries({queryKey: ['subjects']});
      qc.invalidateQueries({queryKey: ['classes']});
    },
  });
};
