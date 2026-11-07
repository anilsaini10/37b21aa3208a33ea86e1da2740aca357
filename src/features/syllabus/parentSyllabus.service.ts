/** Parent Syllabus service — child's syllabus overview, subject/chapter detail, progress. */
import {useQuery} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';
import type {
  ParentSubjectSyllabus,
  ParentSubjectDetail,
  ParentChapterDetail,
  ParentOverallProgress,
} from '../../shared/types';

export const parentSyllabusApi = {
  overview: async (studentId: string, sessionYear?: number): Promise<ParentSubjectSyllabus[]> => {
    try {
      const {data} = await axiosClient.get<ParentSubjectSyllabus[]>(Endpoints.parentSyllabus.overview, {
        params: {studentId, sessionYear},
      });
      return data;
    } catch (e) {
      rethrowApiError(e, 'Failed to load syllabus.');
    }
  },
  subjectDetail: async (subjectId: string, studentId: string): Promise<ParentSubjectDetail> => {
    try {
      const {data} = await axiosClient.get<ParentSubjectDetail>(Endpoints.parentSyllabus.subjectDetail(subjectId), {
        params: {studentId},
      });
      return data;
    } catch (e) {
      rethrowApiError(e, 'Failed to load subject detail.');
    }
  },
  chapterDetail: async (planChapterId: string, studentId: string): Promise<ParentChapterDetail> => {
    try {
      const {data} = await axiosClient.get<ParentChapterDetail>(Endpoints.parentSyllabus.chapterDetail(planChapterId), {
        params: {studentId},
      });
      return data;
    } catch (e) {
      rethrowApiError(e, 'Failed to load chapter detail.');
    }
  },
  progress: async (studentId: string, sessionYear?: number): Promise<ParentOverallProgress> => {
    try {
      const {data} = await axiosClient.get<ParentOverallProgress>(Endpoints.parentSyllabus.progress, {
        params: {studentId, sessionYear},
      });
      return data;
    } catch (e) {
      rethrowApiError(e, 'Failed to load progress.');
    }
  },
};

export const useParentSyllabusOverview = (studentId: string | undefined, sessionYear?: number) =>
  useQuery({
    queryKey: ['parentSyllabusOverview', studentId, sessionYear],
    queryFn: () => parentSyllabusApi.overview(studentId!, sessionYear),
    enabled: !!studentId,
  });

export const useParentSubjectDetail = (subjectId: string | undefined, studentId: string | undefined) =>
  useQuery({
    queryKey: ['parentSubjectDetail', subjectId, studentId],
    queryFn: () => parentSyllabusApi.subjectDetail(subjectId!, studentId!),
    enabled: !!subjectId && !!studentId,
  });

export const useParentChapterDetail = (planChapterId: string | undefined, studentId: string | undefined) =>
  useQuery({
    queryKey: ['parentChapterDetail', planChapterId, studentId],
    queryFn: () => parentSyllabusApi.chapterDetail(planChapterId!, studentId!),
    enabled: !!planChapterId && !!studentId,
  });

export const useParentSyllabusProgress = (studentId: string | undefined, sessionYear?: number) =>
  useQuery({
    queryKey: ['parentSyllabusProgress', studentId, sessionYear],
    queryFn: () => parentSyllabusApi.progress(studentId!, sessionYear),
    enabled: !!studentId,
  });
