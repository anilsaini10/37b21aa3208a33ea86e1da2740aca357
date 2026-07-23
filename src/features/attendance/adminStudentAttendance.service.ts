/**
 * Admin's read-only view of student attendance — real backend (Express + Prisma).
 *
 * Day-by-day, not a range: a class-wise summary for one date, and a paginated,
 * searchable per-student status list for that class on that date. Marking stays
 * the class teacher's job via `/api/teacher/attendance`.
 */
import {useQuery} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';
import type {ClassAttendanceStudentsResponse, ClassAttendanceSummary} from '../../shared/types';

export interface ClassAttendanceStudentsFilters {
  date?: string;
  page?: number;
  pageSize?: number;
  search?: string;
}

export const adminStudentAttendanceApi = {
  classSummaries: async (date?: string): Promise<{date: string; classes: ClassAttendanceSummary[]}> => {
    try {
      const {data} = await axiosClient.get<{date: string; classes: ClassAttendanceSummary[]}>(
        Endpoints.admin.attendance_classes,
        {params: {date}},
      );
      return data;
    } catch (e) {
      console.error('adminStudentAttendanceApi.classSummaries failed', e);
      rethrowApiError(e, 'Failed to load attendance summary.');
    }
  },

  classStudents: async (
    classId: string,
    filters: ClassAttendanceStudentsFilters,
  ): Promise<ClassAttendanceStudentsResponse> => {
    try {
      const {data} = await axiosClient.get<ClassAttendanceStudentsResponse>(
        Endpoints.admin.attendance_classStudents(classId),
        {params: filters},
      );
      return data;
    } catch (e) {
      console.error('adminStudentAttendanceApi.classStudents failed', e);
      rethrowApiError(e, 'Failed to load class attendance.');
    }
  },
};

export const useClassAttendanceSummaries = (date: string) =>
  useQuery({
    queryKey: ['adminAttendanceClasses', date],
    queryFn: () => adminStudentAttendanceApi.classSummaries(date),
    enabled: !!date,
  });

export const useClassStudentsAttendance = (classId: string, filters: ClassAttendanceStudentsFilters) =>
  useQuery({
    queryKey: ['adminAttendanceClassStudents', classId, filters],
    queryFn: () => adminStudentAttendanceApi.classStudents(classId, filters),
    enabled: !!classId,
  });
