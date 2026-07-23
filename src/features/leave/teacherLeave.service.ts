/**
 * Teacher's leave-review inbox — real backend (Express + Prisma).
 *
 * Scoped server-side to sections this teacher is the Class Teacher of — same
 * restriction as attendance marking. A subject-only teacher sees nothing here.
 */
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';
import type {Leave, LeaveStatus, ReviewLeaveInput} from '../../shared/types';

export const teacherLeaveApi = {
  list: async (status?: LeaveStatus): Promise<Leave[]> => {
    try {
      const {data} = await axiosClient.get<Leave[]>(Endpoints.teacher.leave, {params: {status}});
      return data;
    } catch (e) {
      console.error('teacherLeaveApi.list failed', e);
      rethrowApiError(e, 'Failed to load leave requests.');
    }
  },

  review: async (leaveId: string, input: ReviewLeaveInput): Promise<Leave> => {
    try {
      const {data} = await axiosClient.patch<Leave>(Endpoints.teacher.leave_byId(leaveId), input);
      return data;
    } catch (e) {
      console.error('teacherLeaveApi.review failed', e);
      rethrowApiError(e, 'Failed to update leave request.');
    }
  },
};

export const useTeacherLeaves = (status?: LeaveStatus) =>
  useQuery({
    queryKey: ['teacherLeave', status],
    queryFn: () => teacherLeaveApi.list(status),
  });

export const useReviewTeacherLeave = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({leaveId, input}: {leaveId: string; input: ReviewLeaveInput}) =>
      teacherLeaveApi.review(leaveId, input),
    onSuccess: () => qc.invalidateQueries({queryKey: ['teacherLeave']}),
  });
};
