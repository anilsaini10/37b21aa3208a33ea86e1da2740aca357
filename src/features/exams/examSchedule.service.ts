/**
 * Exam date sheet + subject-wise marks (admin) — real backend (Express + Prisma).
 *
 * Exam → date sheet (one "paper" per class + subject, with date/time/room/invigilator)
 * → per-paper marks grid. Admin can view and override marks teachers entered.
 */
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';
import type {
  ExamPaper,
  ExamResultStatus,
  ExamScheduleResponse,
  PaperMarksResponse,
} from '../../shared/types';

export interface CreatePaperInput {
  classId: string;
  subjectId: string;
  /** "YYYY-MM-DD" — always a plain string, never a Date/ISO datetime. */
  date: string;
  /** "HH:MM", 24h. */
  startTime: string;
  endTime: string;
  /** Omit to use the class's exam maxMarks. */
  maxMarks?: number;
  roomNo?: string;
  invigilatorId?: string;
}

/** Any subset — `null` clears `roomNo` / `invigilatorId`. */
export type UpdatePaperInput = Partial<Omit<CreatePaperInput, 'roomNo' | 'invigilatorId'>> & {
  roomNo?: string | null;
  invigilatorId?: string | null;
};

export interface PaperMarkInput {
  studentId: string;
  status: ExamResultStatus;
  /** Required for GRADED; must be omitted/null for ABSENT and PENDING. */
  marksObtained?: number | null;
  grade?: string;
  remarks?: string;
}

export interface PaperStudentsParams {
  sectionId?: string;
  search?: string;
}

export interface SaveMarksResponse extends PaperMarksResponse {
  savedCount: number;
}

export const examScheduleApi = {
  list: async (examId: string, classId?: string): Promise<ExamScheduleResponse> => {
    try {
      const {data} = await axiosClient.get<ExamScheduleResponse>(Endpoints.admin.exams_schedule(examId), {
        params: classId ? {classId} : undefined,
      });
      return data;
    } catch (e) {
      console.error('examScheduleApi.list failed', e);
      rethrowApiError(e, 'Failed to load date sheet.');
    }
  },

  create: async (examId: string, input: CreatePaperInput): Promise<ExamPaper> => {
    try {
      const {data} = await axiosClient.post<ExamPaper>(Endpoints.admin.exams_schedule(examId), input);
      return data;
    } catch (e) {
      console.error('examScheduleApi.create failed', e);
      rethrowApiError(e, 'Failed to add paper.');
    }
  },

  createBulk: async (examId: string, papers: CreatePaperInput[]): Promise<{items: ExamPaper[]}> => {
    try {
      const {data} = await axiosClient.post<{items: ExamPaper[]}>(Endpoints.admin.exams_scheduleBulk(examId), {papers});
      return data;
    } catch (e) {
      console.error('examScheduleApi.createBulk failed', e);
      rethrowApiError(e, 'Failed to save date sheet.');
    }
  },

  update: async (examId: string, scheduleId: string, input: UpdatePaperInput): Promise<ExamPaper> => {
    try {
      const {data} = await axiosClient.patch<ExamPaper>(Endpoints.admin.exams_scheduleById(examId, scheduleId), input);
      return data;
    } catch (e) {
      console.error('examScheduleApi.update failed', e);
      rethrowApiError(e, 'Failed to update paper.');
    }
  },

  remove: async (examId: string, scheduleId: string): Promise<void> => {
    try {
      await axiosClient.delete(Endpoints.admin.exams_scheduleById(examId, scheduleId));
    } catch (e) {
      console.error('examScheduleApi.remove failed', e);
      rethrowApiError(e, 'Failed to delete paper.');
    }
  },

  students: async (examId: string, scheduleId: string, params?: PaperStudentsParams): Promise<PaperMarksResponse> => {
    try {
      const {data} = await axiosClient.get<PaperMarksResponse>(
        Endpoints.admin.exams_scheduleStudents(examId, scheduleId),
        {params},
      );
      return data;
    } catch (e) {
      console.error('examScheduleApi.students failed', e);
      rethrowApiError(e, 'Failed to load students.');
    }
  },

  saveMarks: async (examId: string, scheduleId: string, marks: PaperMarkInput[]): Promise<SaveMarksResponse> => {
    try {
      const {data} = await axiosClient.put<SaveMarksResponse>(Endpoints.admin.exams_scheduleMarks(examId, scheduleId), {
        marks,
      });
      return data;
    } catch (e) {
      console.error('examScheduleApi.saveMarks failed', e);
      rethrowApiError(e, 'Failed to save marks.');
    }
  },
};

export const useExamSchedule = (examId: string, classId?: string) =>
  useQuery({
    queryKey: ['examSchedule', examId, classId],
    queryFn: () => examScheduleApi.list(examId, classId),
    enabled: !!examId,
  });

/** Date sheet edits change paper counts / class progress — refresh everything hanging off this exam. */
function invalidateExamSchedule(qc: ReturnType<typeof useQueryClient>, examId: string): void {
  qc.invalidateQueries({queryKey: ['examSchedule', examId]});
  qc.invalidateQueries({queryKey: ['paperMarks', examId]});
}

export const useCreatePaper = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({examId, input}: {examId: string; input: CreatePaperInput}) => examScheduleApi.create(examId, input),
    onSuccess: (_data, {examId}) => invalidateExamSchedule(qc, examId),
  });
};

export const useCreatePapersBulk = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({examId, papers}: {examId: string; papers: CreatePaperInput[]}) =>
      examScheduleApi.createBulk(examId, papers),
    onSuccess: (_data, {examId}) => invalidateExamSchedule(qc, examId),
  });
};

export const useUpdatePaper = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({examId, scheduleId, input}: {examId: string; scheduleId: string; input: UpdatePaperInput}) =>
      examScheduleApi.update(examId, scheduleId, input),
    onSuccess: (_data, {examId}) => invalidateExamSchedule(qc, examId),
  });
};

export const useDeletePaper = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({examId, scheduleId}: {examId: string; scheduleId: string}) =>
      examScheduleApi.remove(examId, scheduleId),
    onSuccess: (_data, {examId}) => invalidateExamSchedule(qc, examId),
  });
};

export const usePaperStudents = (examId: string, scheduleId: string, params?: PaperStudentsParams) =>
  useQuery({
    queryKey: ['paperMarks', examId, scheduleId, params],
    queryFn: () => examScheduleApi.students(examId, scheduleId, params),
    enabled: !!examId && !!scheduleId,
  });

export const useSavePaperMarks = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({examId, scheduleId, marks}: {examId: string; scheduleId: string; marks: PaperMarkInput[]}) =>
      examScheduleApi.saveMarks(examId, scheduleId, marks),
    onSuccess: (_data, {examId}) => {
      // `markedCount` on the date sheet changes with every save.
      qc.invalidateQueries({queryKey: ['examSchedule', examId]});
    },
  });
};
