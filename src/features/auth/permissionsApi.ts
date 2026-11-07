import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';
import {logger} from '../../core/utils/logger';

export interface PermissionsApiResponse {
  role: string;
  customRole: string | null;
  permissions: Record<string, unknown>;
  blockedBySchool: string[];
  blockedByRoleLimit: string[];
  schoolPermissions: Record<string, unknown>;
  rolePermissions: Record<string, unknown>;
  isSuperAdmin: boolean;
}

export async function fetchMyPermissions(): Promise<PermissionsApiResponse> {
  try {
    const {data} = await axiosClient.get<PermissionsApiResponse>(
      Endpoints.auth.permissions,
    );
    return data;
  } catch (e) {
    logger.warn('fetchMyPermissions failed', e);
    rethrowApiError(e, 'Failed to load permissions.');
  }
}
