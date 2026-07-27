/**
 * Teacher's own profile — real backend, `GET /api/teacher/profile`. Read-only:
 * this screen never submits qualification/experience/subjectsTaught/classTeacherOf
 * back — those are admin-managed. Editing name/phone still goes through the
 * separate `PATCH /api/teacher/profile` self-service flow, unchanged here.
 *
 * Same raw shape as the admin's teacher record, so this reuses `teachers.service.ts`'s
 * normalisation instead of duplicating it.
 */
import {useQuery} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';
import {toTeacher} from '../teachers/teachers.service';
import type {TeacherApi} from '../teachers/teachers.service';
import type {Teacher} from '../../shared/types';

export const teacherOwnProfileApi = {
  get: async (): Promise<Teacher> => {
    try {
      const {data} = await axiosClient.get<TeacherApi>(Endpoints.teacher.profile);
      return toTeacher(data);
    } catch (e) {
      console.error('teacherOwnProfileApi.get failed', e);
      rethrowApiError(e, 'Failed to load your profile.');
    }
  },
};

export const useTeacherOwnProfile = () =>
  useQuery({queryKey: ['teacherOwnProfile'], queryFn: teacherOwnProfileApi.get});
