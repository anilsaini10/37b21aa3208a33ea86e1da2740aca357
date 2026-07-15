/**
 * Admin Exams service — real backend (Express + Prisma).
 *
 * Drill-down: Exams list → classes assigned to an exam → students in one of those
 * classes → grade (create/update/delete) that student's result for the exam.
 */
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';
import type {
  AdminExam,
  ExamClassProgress,
  ExamClassStudentRow,
  ExamResultDetail,
  ExamResultStatus,
  Paginated,
  QueryParams,
} from '../../shared/types';

export interface ExamClassInput {
  classId: string;
  maxMarks: number;
}

export interface CreateExamInput {
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  classes: ExamClassInput[];
}

/** Editing an exam only ever touches these fields — classes are managed separately. */
export type UpdateExamInput = Partial<{
  title: string;
  description: string;
  startDate: string;
  endDate: string;
}>;

export interface CreateResultInput {
  studentId: string;
  marksObtained?: number;
  grade?: string;
  remarks?: string;
  status?: ExamResultStatus;
}

export type UpdateResultInput = Partial<Omit<CreateResultInput, 'studentId'>>;

interface ExamClassesUpdateResponse {
  examId: string;
  classes: {classId: string; className: string; maxMarks: number}[];
}

export const adminExamsApi = {
  list: async (params?: QueryParams): Promise<Paginated<AdminExam>> => {
    try {
      const {data} = await axiosClient.get<Paginated<AdminExam>>(Endpoints.admin.exams, {params});
      return data;
    } catch (e) {
      console.error('adminExamsApi.list failed', e);
      rethrowApiError(e, 'Failed to load exams.');
    }
  },

  getById: async (examId: string): Promise<AdminExam> => {
    try {
      const {data} = await axiosClient.get<AdminExam>(Endpoints.admin.exams_byId(examId));
      return data;
    } catch (e) {
      console.error('adminExamsApi.getById failed', e);
      rethrowApiError(e, 'Failed to load exam.');
    }
  },

  create: async (input: CreateExamInput): Promise<AdminExam> => {
    try {
      const {data} = await axiosClient.post<AdminExam>(Endpoints.admin.exams, input);
      return data;
    } catch (e) {
      console.error('adminExamsApi.create failed', e);
      rethrowApiError(e, 'Failed to create exam.');
    }
  },

  update: async (examId: string, input: UpdateExamInput): Promise<AdminExam> => {
    try {
      const {data} = await axiosClient.patch<AdminExam>(Endpoints.admin.exams_byId(examId), input);
      return data;
    } catch (e) {
      console.error('adminExamsApi.update failed', e);
      rethrowApiError(e, 'Failed to update exam.');
    }
  },

  remove: async (examId: string): Promise<void> => {
    try {
      await axiosClient.delete(Endpoints.admin.exams_byId(examId));
    } catch (e) {
      console.error('adminExamsApi.remove failed', e);
      rethrowApiError(e, 'Failed to delete exam.');
    }
  },

  classesForExam: async (examId: string): Promise<ExamClassProgress[]> => {
    try {
      const {data} = await axiosClient.get<ExamClassProgress[]>(Endpoints.admin.exams_classes(examId));
      return data;
    } catch (e) {
      console.error('adminExamsApi.classesForExam failed', e);
      rethrowApiError(e, 'Failed to load exam classes.');
    }
  },

  addClass: async (examId: string, input: ExamClassInput): Promise<ExamClassesUpdateResponse> => {
    try {
      const {data} = await axiosClient.post<ExamClassesUpdateResponse>(Endpoints.admin.exams_classes(examId), input);
      return data;
    } catch (e) {
      console.error('adminExamsApi.addClass failed', e);
      rethrowApiError(e, 'Failed to add class to exam.');
    }
  },

  removeClass: async (examId: string, classId: string): Promise<void> => {
    try {
      await axiosClient.delete(Endpoints.admin.exams_classById(examId, classId));
    } catch (e) {
      console.error('adminExamsApi.removeClass failed', e);
      rethrowApiError(e, 'Failed to remove class from exam.');
    }
  },

  studentsForClass: async (
    examId: string,
    classId: string,
    params?: QueryParams,
  ): Promise<Paginated<ExamClassStudentRow> & {maxMarks: number}> => {
    try {
      const {data} = await axiosClient.get<Paginated<ExamClassStudentRow> & {maxMarks: number}>(
        Endpoints.admin.exams_classStudents(examId, classId),
        {params},
      );
      return data;
    } catch (e) {
      console.error('adminExamsApi.studentsForClass failed', e);
      rethrowApiError(e, 'Failed to load students.');
    }
  },

  createResult: async (examId: string, input: CreateResultInput): Promise<ExamResultDetail> => {
    try {
      const {data} = await axiosClient.post<ExamResultDetail>(Endpoints.admin.exams_results(examId), input);
      return data;
    } catch (e) {
      console.error('adminExamsApi.createResult failed', e);
      rethrowApiError(e, 'Failed to save result.');
    }
  },

  updateResult: async (examId: string, resultId: string, input: UpdateResultInput): Promise<ExamResultDetail> => {
    try {
      const {data} = await axiosClient.patch<ExamResultDetail>(Endpoints.admin.exams_resultById(examId, resultId), input);
      return data;
    } catch (e) {
      console.error('adminExamsApi.updateResult failed', e);
      rethrowApiError(e, 'Failed to update result.');
    }
  },

  removeResult: async (examId: string, resultId: string): Promise<void> => {
    try {
      await axiosClient.delete(Endpoints.admin.exams_resultById(examId, resultId));
    } catch (e) {
      console.error('adminExamsApi.removeResult failed', e);
      rethrowApiError(e, 'Failed to delete result.');
    }
  },
};

export const useAdminExams = (params?: QueryParams) =>
  useQuery({queryKey: ['adminExams', params], queryFn: () => adminExamsApi.list(params)});

/** `initial` (e.g. the row already shown in the list) renders instantly while a fresh copy refetches in the background. */
export const useAdminExam = (examId: string, initial?: AdminExam) =>
  useQuery({
    queryKey: ['adminExam', examId],
    queryFn: () => adminExamsApi.getById(examId),
    enabled: !!examId,
    initialData: initial,
  });

export const useCreateExam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateExamInput) => adminExamsApi.create(input),
    onSuccess: () => qc.invalidateQueries({queryKey: ['adminExams']}),
  });
};

export const useUpdateExam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({examId, input}: {examId: string; input: UpdateExamInput}) => adminExamsApi.update(examId, input),
    onSuccess: (_data, {examId}) => {
      qc.invalidateQueries({queryKey: ['adminExams']});
      qc.invalidateQueries({queryKey: ['adminExam', examId]});
    },
  });
};

export const useDeleteExam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (examId: string) => adminExamsApi.remove(examId),
    onSuccess: () => qc.invalidateQueries({queryKey: ['adminExams']}),
  });
};

export const useExamClasses = (examId: string) =>
  useQuery({
    queryKey: ['examClasses', examId],
    queryFn: () => adminExamsApi.classesForExam(examId),
    enabled: !!examId,
  });

export const useAddExamClass = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({examId, input}: {examId: string; input: ExamClassInput}) => adminExamsApi.addClass(examId, input),
    onSuccess: (_data, {examId}) => qc.invalidateQueries({queryKey: ['examClasses', examId]}),
  });
};

export const useRemoveExamClass = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({examId, classId}: {examId: string; classId: string}) => adminExamsApi.removeClass(examId, classId),
    onSuccess: (_data, {examId}) => qc.invalidateQueries({queryKey: ['examClasses', examId]}),
  });
};

export const useExamClassStudents = (examId: string, classId: string, params?: QueryParams) =>
  useQuery({
    queryKey: ['examClassStudents', examId, classId, params],
    queryFn: () => adminExamsApi.studentsForClass(examId, classId, params),
    enabled: !!examId && !!classId,
  });

export const useCreateExamResult = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({examId, input}: {examId: string; input: CreateResultInput}) => adminExamsApi.createResult(examId, input),
    onSuccess: (_data, {examId}) => {
      qc.invalidateQueries({queryKey: ['examClassStudents', examId]});
      qc.invalidateQueries({queryKey: ['examClasses', examId]});
    },
  });
};

export const useUpdateExamResult = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({examId, resultId, input}: {examId: string; resultId: string; input: UpdateResultInput}) =>
      adminExamsApi.updateResult(examId, resultId, input),
    onSuccess: (_data, {examId}) => {
      qc.invalidateQueries({queryKey: ['examClassStudents', examId]});
      qc.invalidateQueries({queryKey: ['examClasses', examId]});
    },
  });
};

export const useDeleteExamResult = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({examId, resultId}: {examId: string; resultId: string}) => adminExamsApi.removeResult(examId, resultId),
    onSuccess: (_data, {examId}) => {
      qc.invalidateQueries({queryKey: ['examClassStudents', examId]});
      qc.invalidateQueries({queryKey: ['examClasses', examId]});
    },
  });
};
