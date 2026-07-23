/**
 * Admin dashboard stats — real backend, `GET /api/admin/dashboard`.
 *
 * The backend will grow this object over time (e.g. pending leave requests,
 * today's attendance %) without changing the endpoint or breaking existing
 * keys. Consumers must read fields by name — never assume a fixed shape or
 * rely on `Object.keys`/positional access — so new fields just show up as
 * additional tiles once UI is built for them.
 */
import {useQuery} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';

export interface AdminDashboardStats {
  /** Currently ACTIVE students only — not a lifetime total. */
  studentsCount?: number;
  /** Currently ACTIVE teachers only — not a lifetime total. */
  teachersCount?: number;
  /** Currently ACTIVE non-teaching staff only — not a lifetime total. */
  staffCount?: number;
  classesCount?: number;
  /** Future fields (e.g. pendingLeaveRequests, todayAttendancePercentage) land here — access by name as UI is built for them. */
  [key: string]: number | undefined;
}

export const adminDashboardApi = {
  stats: async (): Promise<AdminDashboardStats> => {
    try {
      const {data} = await axiosClient.get<AdminDashboardStats>(Endpoints.admin.dashboard);
      return data;
    } catch (e) {
      console.error('adminDashboardApi.stats failed', e);
      rethrowApiError(e, 'Failed to load dashboard stats.');
    }
  },
};

export const useAdminDashboardStats = () =>
  useQuery({queryKey: ['adminDashboardStats'], queryFn: adminDashboardApi.stats});
