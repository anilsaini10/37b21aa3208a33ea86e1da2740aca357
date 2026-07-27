/**
 * Teacher dashboard stats — real backend, `GET /api/teacher/dashboard`.
 *
 * `attendance` lists only the section(s) this teacher is the homeroom Class
 * Teacher of — empty when they aren't one anywhere, which the dashboard
 * screen treats as "hide this block", not an error.
 */
import {useQuery} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';

export interface TeacherHomeroomAttendanceStatus {
  sectionId: string;
  sectionName: string;
  classId: string;
  className: string;
  totalStudents: number;
  markedCount: number;
  isMarked: boolean;
}

export interface TeacherDashboardStats {
  date: string;
  todayClassesCount: number;
  attendance: TeacherHomeroomAttendanceStatus[];
}

export const teacherDashboardApi = {
  stats: async (): Promise<TeacherDashboardStats> => {
    try {
      const {data} = await axiosClient.get<TeacherDashboardStats>(Endpoints.teacher.dashboard);
      return data;
    } catch (e) {
      console.error('teacherDashboardApi.stats failed', e);
      rethrowApiError(e, 'Failed to load dashboard stats.');
    }
  },
};

export const useTeacherDashboardStats = () =>
  useQuery({queryKey: ['teacherDashboardStats'], queryFn: teacherDashboardApi.stats});
