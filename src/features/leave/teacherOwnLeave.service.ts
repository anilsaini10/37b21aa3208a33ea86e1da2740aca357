/**
 * Teacher's own leave requests — real backend (Express + Prisma).
 *
 * Separate from student-leave review — this is the teacher applying for their
 * own leave, reviewed by an admin. No attendance auto-marking: staff
 * attendance isn't tracked in this system.
 */
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';
import type {ApplyTeacherLeaveInput, LeaveStatus, MyLeave} from '../../shared/types';

export const teacherOwnLeaveApi = {
  list: async (status?: LeaveStatus): Promise<MyLeave[]> => {
    try {
      const {data} = await axiosClient.get<MyLeave[]>(Endpoints.teacher.myLeave, {params: {status}});
      return data;
    } catch (e) {
      console.error('teacherOwnLeaveApi.list failed', e);
      rethrowApiError(e, 'Failed to load your leave requests.');
    }
  },

  apply: async (input: ApplyTeacherLeaveInput): Promise<MyLeave> => {
    try {
      const {data} = await axiosClient.post<MyLeave>(Endpoints.teacher.myLeave, input);
      return data;
    } catch (e) {
      console.error('teacherOwnLeaveApi.apply failed', e);
      rethrowApiError(e, 'Failed to submit leave request.');
    }
  },

  cancel: async (leaveId: string): Promise<void> => {
    try {
      await axiosClient.delete(Endpoints.teacher.myLeave_byId(leaveId));
    } catch (e) {
      console.error('teacherOwnLeaveApi.cancel failed', e);
      rethrowApiError(e, 'Failed to cancel leave request.');
    }
  },
};

export const useMyLeaves = (status?: LeaveStatus) =>
  useQuery({queryKey: ['myLeave', status], queryFn: () => teacherOwnLeaveApi.list(status)});

export const useApplyMyLeave = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ApplyTeacherLeaveInput) => teacherOwnLeaveApi.apply(input),
    onSuccess: () => qc.invalidateQueries({queryKey: ['myLeave']}),
  });
};

export const useCancelMyLeave = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (leaveId: string) => teacherOwnLeaveApi.cancel(leaveId),
    onSuccess: () => qc.invalidateQueries({queryKey: ['myLeave']}),
  });
};
