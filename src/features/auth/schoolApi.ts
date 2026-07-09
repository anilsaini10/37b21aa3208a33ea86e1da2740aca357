/** School directory — lets a teacher/parent find their school before logging in. */
import {useQuery} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import type {SchoolSummary} from '../../shared/types';

export const schoolApi = {
  /** Hits the real backend — requires a `GET /schools?search=` endpoint there. */
  async search(query: string): Promise<SchoolSummary[]> {
    const {data} = await axiosClient.get<SchoolSummary[]>(Endpoints.schools.search, {
      params: query ? {search: query} : undefined,
    });
    return data;
  },
};

export const useSchools = (search: string) =>
  useQuery({
    queryKey: ['schools', search],
    queryFn: () => schoolApi.search(search),
  });
