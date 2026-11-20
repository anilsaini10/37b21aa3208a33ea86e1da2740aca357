/** Admin parent queries — view, reply and update status on parent-submitted queries. */
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';

export type QueryStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface AdminParentQuery {
  id: string;
  subject: string;
  message: string;
  status: QueryStatus;
  reply: string | null;
  repliedAt: string | null;
  schoolId: string;
  schoolName: string;
  createdBy: {id: string; name: string; email: string; phone: string};
  repliedBy: {id: string; name: string} | null;
  createdAt: string;
  updatedAt: string;
}

export interface StatusCounts {
  OPEN: number;
  IN_PROGRESS: number;
  RESOLVED: number;
  CLOSED: number;
}

export interface AdminParentQueryListResponse {
  items: AdminParentQuery[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  statusCounts: StatusCounts;
}

export interface UpdateQueryInput {
  status?: QueryStatus;
  reply?: string | null;
}

export const adminParentQueryApi = {
  list: async (
    page = 1,
    pageSize = 20,
    status?: QueryStatus,
    search?: string,
  ): Promise<AdminParentQueryListResponse> => {
    try {
      const params: Record<string, string | number> = {page, pageSize};
      if (status) params.status = status;
      if (search) params.search = search;
      const {data} = await axiosClient.get<{data: AdminParentQueryListResponse}>(
        Endpoints.admin.parentQueries,
        {params},
      );
      return data.data;
    } catch (e) {
      rethrowApiError(e, 'Failed to load parent queries.');
    }
  },

  getById: async (queryId: string): Promise<AdminParentQuery> => {
    try {
      const {data} = await axiosClient.get<{data: AdminParentQuery}>(
        Endpoints.admin.parentQuery_byId(queryId),
      );
      return data.data;
    } catch (e) {
      rethrowApiError(e, 'Failed to load query detail.');
    }
  },

  update: async (queryId: string, input: UpdateQueryInput): Promise<AdminParentQuery> => {
    try {
      const {data} = await axiosClient.patch<{data: AdminParentQuery}>(
        Endpoints.admin.parentQuery_byId(queryId),
        input,
      );
      return data.data;
    } catch (e) {
      rethrowApiError(e, 'Failed to update query.');
    }
  },
};

const QUERY_KEY = 'adminParentQueries';

export const useAdminParentQueries = (page: number, status?: QueryStatus, search?: string) =>
  useQuery({
    queryKey: [QUERY_KEY, page, status, search],
    queryFn: () => adminParentQueryApi.list(page, 20, status, search),
  });

export const useAdminParentQueryDetail = (queryId: string) =>
  useQuery({
    queryKey: [QUERY_KEY, queryId],
    queryFn: () => adminParentQueryApi.getById(queryId),
    enabled: !!queryId,
  });

export const useUpdateParentQuery = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({queryId, input}: {queryId: string; input: UpdateQueryInput}) =>
      adminParentQueryApi.update(queryId, input),
    onSuccess: () => qc.invalidateQueries({queryKey: [QUERY_KEY]}),
  });
};
