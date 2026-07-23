/** Admin's teacher-leave review inbox — real backend. Every teacher's leave requests, school-wide. */
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';
import type {LeaveStatus, ReviewLeaveInput, TeacherLeave} from '../../shared/types';

export const adminTeacherLeaveApi = {
  list: async (status?: LeaveStatus): Promise<TeacherLeave[]> => {
    try {
      const {data} = await axiosClient.get<TeacherLeave[]>(Endpoints.admin.leave_teachers, {params: {status}});
      return data;
    } catch (e) {
      console.error('adminTeacherLeaveApi.list failed', e);
      rethrowApiError(e, 'Failed to load leave requests.');
    }
  },

  review: async (leaveId: string, input: ReviewLeaveInput): Promise<TeacherLeave> => {
    try {
      const {data} = await axiosClient.patch<TeacherLeave>(Endpoints.admin.leave_teachers_byId(leaveId), input);
      return data;
    } catch (e) {
      console.error('adminTeacherLeaveApi.review failed', e);
      rethrowApiError(e, 'Failed to update leave request.');
    }
  },
};

export const useAdminTeacherLeaves = (status?: LeaveStatus) =>
  useQuery({queryKey: ['adminTeacherLeave', status], queryFn: () => adminTeacherLeaveApi.list(status)});

export const useReviewTeacherLeaveAsAdmin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({leaveId, input}: {leaveId: string; input: ReviewLeaveInput}) =>
      adminTeacherLeaveApi.review(leaveId, input),
    onSuccess: () => qc.invalidateQueries({queryKey: ['adminTeacherLeave']}),
  });
};
