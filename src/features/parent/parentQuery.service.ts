/** Parent queries — submit questions to school admin and track their status. */
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError, extractErrorStatus, extractErrorDetails} from '../../core/api/apiError';

export type QueryStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface ParentQuery {
  id: string;
  subject: string;
  message: string;
  status: QueryStatus;
  reply: string | null;
  repliedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ParentQueryListResponse {
  items: ParentQuery[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface SubmitQueryInput {
  subject: string;
  message: string;
}

export const parentQueryApi = {
  list: async (page = 1, pageSize = 20, status?: QueryStatus): Promise<ParentQueryListResponse> => {
    try {
      const params: Record<string, string | number> = {page, pageSize};
      if (status) {
        params.status = status;
      }
      const {data} = await axiosClient.get<{data: ParentQueryListResponse}>(Endpoints.students.parentQueries, {params});
      return data.data ?? {items: [], page, pageSize, total: 0, totalPages: 0};
    } catch (e) {
      rethrowApiError(e, 'Failed to load queries.');
    }
  },

  getById: async (queryId: string): Promise<ParentQuery> => {
    try {
      const {data} = await axiosClient.get<{data: ParentQuery}>(Endpoints.students.parentQuery_byId(queryId));
      return data.data;
    } catch (e) {
      rethrowApiError(e, 'Failed to load query detail.');
    }
  },

  submit: async (input: SubmitQueryInput): Promise<ParentQuery> => {
    try {
      const {data} = await axiosClient.post<{data: ParentQuery}>(Endpoints.students.parentQueries, input);
      return data.data;
    } catch (e) {
      const status = extractErrorStatus(e);
      if (status === 429) {
        const details = extractErrorDetails(e);
        const retryMinutes = (details?.retryAfterMinutes as number) ?? 60;
        const err = new Error(`RATE_LIMITED:${retryMinutes}`) as Error & {code?: string; status?: number};
        err.code = 'RATE_LIMITED';
        err.status = 429;
        throw err;
      }
      rethrowApiError(e, 'Failed to submit query.');
    }
  },
};

const QUERY_KEY = 'parentQueries';

export const useParentQueries = (page: number, status?: QueryStatus) =>
  useQuery({
    queryKey: [QUERY_KEY, page, status],
    queryFn: () => parentQueryApi.list(page, 20, status),
  });

export const useParentQueryDetail = (queryId: string) =>
  useQuery({
    queryKey: [QUERY_KEY, queryId],
    queryFn: () => parentQueryApi.getById(queryId),
    enabled: !!queryId,
  });

export const useSubmitQuery = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SubmitQueryInput) => parentQueryApi.submit(input),
    onSuccess: () => qc.invalidateQueries({queryKey: [QUERY_KEY]}),
  });
};
