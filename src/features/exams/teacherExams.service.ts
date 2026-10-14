/**
 * Teacher's exams — real backend (Express + Prisma), scoped server-side to the teacher.
 *
 * Lists the papers a teacher teaches (own sections only) or invigilates, and
 * lets them view / enter marks for the students of their own sections.
 */
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';
import type {PaperMarksResponse, TeacherExam} from '../../shared/types';
import type {PaperMarkInput, PaperStudentsParams, SaveMarksResponse} from './examSchedule.service';

export const teacherExamsApi = {
  list: async (examId?: string): Promise<TeacherExam[]> => {
    try {
      const {data} = await axiosClient.get<TeacherExam[]>(Endpoints.teacher.exams, {
        params: examId ? {examId} : undefined,
      });
      return data;
    } catch (e) {
      console.error('teacherExamsApi.list failed', e);
      rethrowApiError(e, 'Failed to load exams.');
    }
  },

  students: async (scheduleId: string, params?: PaperStudentsParams): Promise<PaperMarksResponse> => {
    try {
      const {data} = await axiosClient.get<PaperMarksResponse>(Endpoints.teacher.exams_scheduleStudents(scheduleId), {
        params,
      });
      return data;
    } catch (e) {
      console.error('teacherExamsApi.students failed', e);
      rethrowApiError(e, 'Failed to load students.');
    }
  },

  saveMarks: async (scheduleId: string, marks: PaperMarkInput[]): Promise<SaveMarksResponse> => {
    try {
      const {data} = await axiosClient.put<SaveMarksResponse>(Endpoints.teacher.exams_scheduleMarks(scheduleId), {marks});
      return data;
    } catch (e) {
      console.error('teacherExamsApi.saveMarks failed', e);
      rethrowApiError(e, 'Failed to save marks.');
    }
  },
};

export const useTeacherExams = () => useQuery({queryKey: ['teacherExams'], queryFn: () => teacherExamsApi.list()});

export const useTeacherPaperStudents = (scheduleId: string, params?: PaperStudentsParams) =>
  useQuery({
    queryKey: ['teacherPaperMarks', scheduleId, params],
    queryFn: () => teacherExamsApi.students(scheduleId, params),
    enabled: !!scheduleId,
  });

export const useSaveTeacherMarks = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({scheduleId, marks}: {scheduleId: string; marks: PaperMarkInput[]}) =>
      teacherExamsApi.saveMarks(scheduleId, marks),
    // `markedCount` on the exams list changes with every save.
    onSuccess: () => qc.invalidateQueries({queryKey: ['teacherExams']}),
  });
};
