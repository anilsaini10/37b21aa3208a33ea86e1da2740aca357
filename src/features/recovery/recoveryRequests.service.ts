import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';
import {QueryKeys} from '../../core/query/queryClient';
import type {
  RecoveryRequestListResponse,
  RecoveryRequestStatus,
  RecoveryRequest,
  RecoveryResetResponse,
} from '../../shared/types';

export interface RecoveryListParams {
  status?: RecoveryRequestStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}

export const recoveryApi = {
  list: async (params: RecoveryListParams): Promise<RecoveryRequestListResponse> => {
    try {
      const {data} = await axiosClient.get<RecoveryRequestListResponse>(
        Endpoints.admin.accountRecovery,
        {params},
      );
      return data;
    } catch (e) {
      console.error('recoveryApi.list failed', e);
      rethrowApiError(e, 'Failed to load recovery requests.');
    }
  },

  getById: async (id: string): Promise<RecoveryRequest> => {
    try {
      const {data} = await axiosClient.get<RecoveryRequest>(
        Endpoints.admin.accountRecovery_byId(id),
      );
      return data;
    } catch (e) {
      console.error('recoveryApi.getById failed', e);
      rethrowApiError(e, 'Failed to load recovery request.');
    }
  },

  reset: async (id: string): Promise<RecoveryResetResponse> => {
    try {
      const {data} = await axiosClient.post<RecoveryResetResponse>(
        Endpoints.admin.accountRecovery_reset(id),
      );
      return data;
    } catch (e) {
      console.error('recoveryApi.reset failed', e);
      rethrowApiError(e, 'Failed to reset password.');
    }
  },

  reject: async (id: string): Promise<RecoveryRequest> => {
    try {
      const {data} = await axiosClient.post<RecoveryRequest>(
        Endpoints.admin.accountRecovery_reject(id),
      );
      return data;
    } catch (e) {
      console.error('recoveryApi.reject failed', e);
      rethrowApiError(e, 'Failed to reject request.');
    }
  },
};

export const useRecoveryRequests = (params: RecoveryListParams) =>
  useQuery({
    queryKey: QueryKeys.recoveryRequests(params),
    queryFn: () => recoveryApi.list(params),
  });

export const useRecoveryRequest = (id: string) =>
  useQuery({
    queryKey: QueryKeys.recoveryRequests({id}),
    queryFn: () => recoveryApi.getById(id),
    enabled: !!id,
  });

export const useResetRecoveryPassword = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => recoveryApi.reset(id),
    onSuccess: () => qc.invalidateQueries({queryKey: ['admin', 'recoveryRequests']}),
  });
};

export const useRejectRecoveryRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => recoveryApi.reject(id),
    onSuccess: () => qc.invalidateQueries({queryKey: ['admin', 'recoveryRequests']}),
  });
};
