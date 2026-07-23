/** Parent's own leave requests for a child — real backend. Every call is scoped to a specific child (`studentId`), sourced from the active child, never hand-typed or cached across a child switch. */
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';
import type {ApplyLeaveInput, Leave, LeaveStatus} from '../../shared/types';

export const parentLeaveApi = {
  list: async (studentId: string, status?: LeaveStatus): Promise<Leave[]> => {
    try {
      const {data} = await axiosClient.get<Leave[]>(Endpoints.students.leave, {params: {studentId, status}});
      return data;
    } catch (e) {
      console.error('parentLeaveApi.list failed', e);
      rethrowApiError(e, 'Failed to load leave requests.');
    }
  },

  apply: async (input: ApplyLeaveInput): Promise<Leave> => {
    try {
      const {data} = await axiosClient.post<Leave>(Endpoints.students.leave, input);
      return data;
    } catch (e) {
      console.error('parentLeaveApi.apply failed', e);
      rethrowApiError(e, 'Failed to submit leave request.');
    }
  },

  cancel: async (leaveId: string): Promise<void> => {
    try {
      await axiosClient.delete(Endpoints.students.leave_byId(leaveId));
    } catch (e) {
      console.error('parentLeaveApi.cancel failed', e);
      rethrowApiError(e, 'Failed to cancel leave request.');
    }
  },
};

export const useParentLeaves = (studentId: string, status?: LeaveStatus) =>
  useQuery({
    queryKey: ['parentLeave', studentId, status],
    queryFn: () => parentLeaveApi.list(studentId, status),
    enabled: !!studentId,
  });

export const useApplyLeave = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ApplyLeaveInput) => parentLeaveApi.apply(input),
    onSuccess: (_data, input) => qc.invalidateQueries({queryKey: ['parentLeave', input.studentId]}),
  });
};

export const useCancelLeave = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (leaveId: string) => parentLeaveApi.cancel(leaveId),
    onSuccess: () => qc.invalidateQueries({queryKey: ['parentLeave']}),
  });
};
