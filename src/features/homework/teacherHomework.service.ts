/** Teacher homework service — real backend (Express + Prisma). Create/edit/delete are restricted to the homework's own creator. */
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';
import type {HomeworkType, Paginated, QueryParams, TeacherHomework} from '../../shared/types';

export interface CreateHomeworkInput {
  classId: string;
  sectionId: string;
  subjectId: string;
  title: string;
  description?: string;
  /** Defaults to 'ASSIGNMENT' server-side when omitted. */
  type?: HomeworkType;
  dueDate: string;
}

/** Editing only ever touches these fields — classId/sectionId/subjectId can't be changed (delete + recreate instead). */
export type UpdateHomeworkInput = Partial<{
  title: string;
  description: string;
  type: HomeworkType;
  dueDate: string;
}>;

export const teacherHomeworkApi = {
  list: async (params?: QueryParams): Promise<Paginated<TeacherHomework>> => {
    try {
      const {data} = await axiosClient.get<Paginated<TeacherHomework>>(Endpoints.teacher.homework, {params});
      return data;
    } catch (e) {
      console.error('teacherHomeworkApi.list failed', e);
      rethrowApiError(e, 'Failed to load homework.');
    }
  },

  getById: async (homeworkId: string): Promise<TeacherHomework> => {
    try {
      const {data} = await axiosClient.get<TeacherHomework>(Endpoints.teacher.homework_byId(homeworkId));
      return data;
    } catch (e) {
      console.error('teacherHomeworkApi.getById failed', e);
      rethrowApiError(e, 'Failed to load homework.');
    }
  },

  create: async (input: CreateHomeworkInput): Promise<TeacherHomework> => {
    try {
      const {data} = await axiosClient.post<TeacherHomework>(Endpoints.teacher.homework, input);
      return data;
    } catch (e) {
      console.error('teacherHomeworkApi.create failed', e);
      rethrowApiError(e, 'Failed to create homework.');
    }
  },

  update: async (homeworkId: string, input: UpdateHomeworkInput): Promise<TeacherHomework> => {
    try {
      const {data} = await axiosClient.patch<TeacherHomework>(Endpoints.teacher.homework_byId(homeworkId), input);
      return data;
    } catch (e) {
      console.error('teacherHomeworkApi.update failed', e);
      rethrowApiError(e, 'Failed to update homework.');
    }
  },

  remove: async (homeworkId: string): Promise<void> => {
    try {
      await axiosClient.delete(Endpoints.teacher.homework_byId(homeworkId));
    } catch (e) {
      console.error('teacherHomeworkApi.remove failed', e);
      rethrowApiError(e, 'Failed to delete homework.');
    }
  },
};

export const useTeacherHomeworkList = (params?: QueryParams) =>
  useQuery({queryKey: ['teacherHomework', params], queryFn: () => teacherHomeworkApi.list(params)});

/** `initial` (e.g. the row already shown in the list) renders instantly while a fresh copy refetches in the background. */
export const useTeacherHomeworkItem = (homeworkId: string, initial?: TeacherHomework) =>
  useQuery({
    queryKey: ['teacherHomeworkItem', homeworkId],
    queryFn: () => teacherHomeworkApi.getById(homeworkId),
    enabled: !!homeworkId,
    initialData: initial,
  });

export const useCreateTeacherHomework = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateHomeworkInput) => teacherHomeworkApi.create(input),
    onSuccess: () => qc.invalidateQueries({queryKey: ['teacherHomework']}),
  });
};

export const useUpdateTeacherHomework = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({homeworkId, input}: {homeworkId: string; input: UpdateHomeworkInput}) =>
      teacherHomeworkApi.update(homeworkId, input),
    onSuccess: (_data, {homeworkId}) => {
      qc.invalidateQueries({queryKey: ['teacherHomework']});
      qc.invalidateQueries({queryKey: ['teacherHomeworkItem', homeworkId]});
    },
  });
};

export const useDeleteTeacherHomework = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (homeworkId: string) => teacherHomeworkApi.remove(homeworkId),
    onSuccess: () => qc.invalidateQueries({queryKey: ['teacherHomework']}),
  });
};
