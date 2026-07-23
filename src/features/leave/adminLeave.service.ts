/** Admin's leave-review inbox — real backend. Every section in the school, no class-teacher scoping (unlike Teacher's view). */
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';
import type {Leave, LeaveStatus, ReviewLeaveInput} from '../../shared/types';

export interface AdminLeaveFilters {
  status?: LeaveStatus;
  classId?: string;
  sectionId?: string;
}

export const adminLeaveApi = {
  list: async (filters: AdminLeaveFilters): Promise<Leave[]> => {
    try {
      const {data} = await axiosClient.get<Leave[]>(Endpoints.admin.leave, {params: filters});
      return data;
    } catch (e) {
      console.error('adminLeaveApi.list failed', e);
      rethrowApiError(e, 'Failed to load leave requests.');
    }
  },

  review: async (leaveId: string, input: ReviewLeaveInput): Promise<Leave> => {
    try {
      const {data} = await axiosClient.patch<Leave>(Endpoints.admin.leave_byId(leaveId), input);
      return data;
    } catch (e) {
      console.error('adminLeaveApi.review failed', e);
      rethrowApiError(e, 'Failed to update leave request.');
    }
  },
};

export const useAdminLeaves = (filters: AdminLeaveFilters) =>
  useQuery({
    queryKey: ['adminLeave', filters],
    queryFn: () => adminLeaveApi.list(filters),
  });

export const useReviewAdminLeave = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({leaveId, input}: {leaveId: string; input: ReviewLeaveInput}) => adminLeaveApi.review(leaveId, input),
    onSuccess: () => qc.invalidateQueries({queryKey: ['adminLeave']}),
  });
};
