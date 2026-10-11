/**
 * Parent dashboard stats — real backend, `GET /api/students/dashboard?studentId=`.
 *
 * Scoped to a single child (`studentId`, from the parent's own child-picker) —
 * throws `NOT_YOUR_CHILD` (403) if the id isn't actually this parent's child.
 */
import {useQuery} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';
import type {AttendanceStatusCode} from '../../shared/types';

export interface ParentDashboardStats {
  parentName: string;
  schoolName: string;
  studentName: string;
  className: string;
  sectionName: string;
  classTeacherName: string | null;
  todayAttendance: {date: string; status: AttendanceStatusCode | null};
  activeHomeworkCount: number;
  upcomingExamsCount: number;
}

export const parentDashboardApi = {
  stats: async (studentId: string): Promise<ParentDashboardStats> => {
    try {
      const {data} = await axiosClient.get<ParentDashboardStats>(Endpoints.students.dashboard, {
        params: {studentId},
      });
      return data;
    } catch (e) {
      console.error('parentDashboardApi.stats failed', e);
      rethrowApiError(e, 'Failed to load dashboard.');
    }
  },
};

export const useParentDashboardStats = (studentId: string | undefined) =>
  useQuery({
    queryKey: ['parentDashboardStats', studentId],
    queryFn: () => parentDashboardApi.stats(studentId as string),
    enabled: !!studentId,
  });
