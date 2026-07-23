/**
 * Teacher's own students service — real backend. `classId` must be one of this
 * teacher's own classes (from `useTeacherClasses`) — the server 403s with
 * `CLASS_NOT_ASSIGNED` otherwise, which should never happen if callers only
 * navigate here with ids sourced from that list.
 */
import {useQuery} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';
import {toStudent, type StudentApi} from '../students/students.service';
import type {Paginated, Student} from '../../shared/types';

export interface TeacherStudentsParams {
  classId: string;
  sectionId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export const teacherStudentsApi = {
  list: async (params: TeacherStudentsParams): Promise<Paginated<Student>> => {
    try {
      const {data} = await axiosClient.get<Paginated<StudentApi>>(Endpoints.teacher.students, {params});
      return {...data, items: data.items.map(toStudent)};
    } catch (e) {
      console.error('teacherStudentsApi.list failed', e);
      rethrowApiError(e, 'Failed to load students.');
    }
  },
};

export const useTeacherStudents = (params: TeacherStudentsParams) =>
  useQuery({
    queryKey: ['teacherStudents', params],
    queryFn: () => teacherStudentsApi.list(params),
    enabled: !!params.classId,
  });
