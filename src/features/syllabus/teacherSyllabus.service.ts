/** Teacher Syllabus service — assigned plans, progress, chapter actions. */
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';
import type {
  TeacherSyllabusAssignment,
  TeacherSyllabusProgress,
  TeacherPlan,
  TeacherChapterDetail,
  SubmitProgressInput,
} from '../../shared/types';

export const teacherSyllabusApi = {
  list: async (params: {sessionYear?: number; classId?: string; subjectId?: string} = {}): Promise<TeacherPlan[]> => {
    try {
      const {data} = await axiosClient.get<TeacherPlan[]>(Endpoints.teacherSyllabus.list, {params});
      return data;
    } catch (e) {
      rethrowApiError(e, 'Failed to load syllabus.');
    }
  },
  classesSubjects: async (): Promise<TeacherSyllabusAssignment[]> => {
    try {
      const {data} = await axiosClient.get<TeacherSyllabusAssignment[]>(Endpoints.teacherSyllabus.classesSubjects);
      return data;
    } catch (e) {
      rethrowApiError(e, 'Failed to load classes & subjects.');
    }
  },
  progress: async (sessionYear: number): Promise<TeacherSyllabusProgress> => {
    try {
      const {data} = await axiosClient.get<TeacherSyllabusProgress>(Endpoints.teacherSyllabus.progress, {params: {sessionYear}});
      return data;
    } catch (e) {
      rethrowApiError(e, 'Failed to load progress.');
    }
  },
  planDetail: async (planId: string): Promise<TeacherPlan> => {
    try {
      const {data} = await axiosClient.get<TeacherPlan>(Endpoints.teacherSyllabus.planById(planId));
      return data;
    } catch (e) {
      rethrowApiError(e, 'Failed to load plan detail.');
    }
  },
  chapterDetail: async (planId: string, planChapterId: string): Promise<TeacherChapterDetail> => {
    try {
      const {data} = await axiosClient.get<TeacherChapterDetail>(Endpoints.teacherSyllabus.chapterDetail(planId, planChapterId));
      return data;
    } catch (e) {
      rethrowApiError(e, 'Failed to load chapter detail.');
    }
  },
  startChapter: async (planId: string, planChapterId: string): Promise<void> => {
    try {
      await axiosClient.post(Endpoints.teacherSyllabus.startChapter(planId, planChapterId));
    } catch (e) {
      rethrowApiError(e, 'Failed to start chapter.');
    }
  },
  submitProgress: async (planId: string, planChapterId: string, input: SubmitProgressInput): Promise<void> => {
    try {
      await axiosClient.post(Endpoints.teacherSyllabus.submitProgress(planId, planChapterId), input);
    } catch (e) {
      rethrowApiError(e, 'Failed to submit progress.');
    }
  },
  completeChapter: async (planId: string, planChapterId: string): Promise<void> => {
    try {
      await axiosClient.post(Endpoints.teacherSyllabus.completeChapter(planId, planChapterId));
    } catch (e) {
      rethrowApiError(e, 'Failed to complete chapter.');
    }
  },
};

export const useTeacherSyllabusList = (params: {sessionYear?: number; classId?: string; subjectId?: string} = {}) =>
  useQuery({
    queryKey: ['teacherSyllabus', params],
    queryFn: () => teacherSyllabusApi.list(params),
  });

export const useTeacherClassesSubjects = () =>
  useQuery({queryKey: ['teacherClassesSubjects'], queryFn: teacherSyllabusApi.classesSubjects});

export const useTeacherSyllabusProgress = (sessionYear: number) =>
  useQuery({
    queryKey: ['teacherSyllabusProgress', sessionYear],
    queryFn: () => teacherSyllabusApi.progress(sessionYear),
    enabled: !!sessionYear,
  });

export const useTeacherPlanDetail = (planId: string | undefined) =>
  useQuery({
    queryKey: ['teacherPlanDetail', planId],
    queryFn: () => teacherSyllabusApi.planDetail(planId!),
    enabled: !!planId,
  });

export const useTeacherChapterDetail = (planId: string | undefined, planChapterId: string | undefined) =>
  useQuery({
    queryKey: ['teacherChapterDetail', planId, planChapterId],
    queryFn: () => teacherSyllabusApi.chapterDetail(planId!, planChapterId!),
    enabled: !!planId && !!planChapterId,
  });

export const useStartChapter = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({planId, planChapterId}: {planId: string; planChapterId: string}) =>
      teacherSyllabusApi.startChapter(planId, planChapterId),
    onSuccess: () => {
      qc.invalidateQueries({queryKey: ['teacherPlanDetail']});
      qc.invalidateQueries({queryKey: ['teacherChapterDetail']});
      qc.invalidateQueries({queryKey: ['teacherSyllabus']});
    },
  });
};

export const useSubmitProgress = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({planId, planChapterId, ...input}: {planId: string; planChapterId: string} & SubmitProgressInput) =>
      teacherSyllabusApi.submitProgress(planId, planChapterId, input),
    onSuccess: () => {
      qc.invalidateQueries({queryKey: ['teacherPlanDetail']});
      qc.invalidateQueries({queryKey: ['teacherChapterDetail']});
      qc.invalidateQueries({queryKey: ['teacherSyllabus']});
      qc.invalidateQueries({queryKey: ['teacherSyllabusProgress']});
    },
  });
};

export const useCompleteChapter = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({planId, planChapterId}: {planId: string; planChapterId: string}) =>
      teacherSyllabusApi.completeChapter(planId, planChapterId),
    onSuccess: () => {
      qc.invalidateQueries({queryKey: ['teacherPlanDetail']});
      qc.invalidateQueries({queryKey: ['teacherChapterDetail']});
      qc.invalidateQueries({queryKey: ['teacherSyllabus']});
      qc.invalidateQueries({queryKey: ['teacherSyllabusProgress']});
    },
  });
};
