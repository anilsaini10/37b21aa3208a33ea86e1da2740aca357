/** Teacher homework service — real backend (Express + Prisma). Create/edit/delete are restricted to the homework's own creator. */
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';
import type {
  HomeworkStatus,
  HomeworkType,
  Paginated,
  QueryParams,
  TeacherHomework,
  HomeworkSubmissions,
  HomeworkSubmissionRecordInput,
} from '../../shared/types';

export interface CreateHomeworkInput {
  classId: string;
  sectionId: string;
  subjectId: string;
  title: string;
  description?: string;
  /** Defaults to 'ASSIGNMENT' server-side when omitted. */
  type?: HomeworkType;
  /** Optional — must be on/before dueDate. Leaving it empty means "available immediately". */
  fromDate?: string;
  dueDate: string;
}

/**
 * Editing only ever touches these fields — classId/sectionId/subjectId can't be changed
 * (delete + recreate instead). `status` never accepts 'SCHEDULED' — that's computed
 * server-side from `fromDate` and rejected (400) if sent directly.
 */
export type UpdateHomeworkInput = Partial<{
  title: string;
  description: string;
  type: HomeworkType;
  fromDate: string;
  dueDate: string;
  status: Extract<HomeworkStatus, 'ACTIVE' | 'IN_PROGRESS' | 'COMPLETED'>;
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

  /** Soft delete — the returned homework has `isActive: false`; nothing else about its data is erased. */
  remove: async (homeworkId: string): Promise<TeacherHomework> => {
    try {
      const {data} = await axiosClient.delete<TeacherHomework>(Endpoints.teacher.homework_byId(homeworkId));
      return data;
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

/**
 * Submission tracking — who submitted a given homework. Marking is a single
 * batched PATCH (one or many students per call); the response only returns a
 * count, so a successful mark just invalidates the list to refetch fresh state
 * rather than trying to hand-merge the response.
 */
export const teacherHomeworkSubmissionsApi = {
  list: async (homeworkId: string): Promise<HomeworkSubmissions> => {
    try {
      const {data} = await axiosClient.get<HomeworkSubmissions>(Endpoints.teacher.homework_students(homeworkId));
      return data;
    } catch (e) {
      console.error('teacherHomeworkSubmissionsApi.list failed', e);
      rethrowApiError(e, 'Failed to load submission tracking.');
    }
  },

  mark: async (homeworkId: string, records: HomeworkSubmissionRecordInput[]): Promise<{homeworkId: string; marked: number}> => {
    try {
      const {data} = await axiosClient.patch<{homeworkId: string; marked: number}>(
        Endpoints.teacher.homework_students(homeworkId),
        {records},
      );
      return data;
    } catch (e) {
      console.error('teacherHomeworkSubmissionsApi.mark failed', e);
      rethrowApiError(e, 'Failed to save submission status.');
    }
  },
};

export const useHomeworkSubmissions = (homeworkId: string) =>
  useQuery({
    queryKey: ['teacherHomeworkSubmissions', homeworkId],
    queryFn: () => teacherHomeworkSubmissionsApi.list(homeworkId),
    enabled: !!homeworkId,
  });

export const useMarkHomeworkSubmissions = (homeworkId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (records: HomeworkSubmissionRecordInput[]) => teacherHomeworkSubmissionsApi.mark(homeworkId, records),
    onSuccess: () => qc.invalidateQueries({queryKey: ['teacherHomeworkSubmissions', homeworkId]}),
  });
};
