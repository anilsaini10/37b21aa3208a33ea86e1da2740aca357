/**
 * Admin's own password change — real backend, `/api/auth/reset-password`.
 *
 * On success the backend revokes refresh tokens on every OTHER session — this
 * device's session stays logged in. A wrong current password comes back as a
 * 401 with `code: "INVALID_CURRENT_PASSWORD"`.
 */
import {useMutation} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';

export const adminAuthApi = {
  changePassword: async (currentPassword: string, newPassword: string): Promise<{message: string}> => {
    try {
      const {data} = await axiosClient.post<{message: string}>(Endpoints.auth.resetPassword, {
        currentPassword,
        newPassword,
      });
      return data;
    } catch (e) {
      console.error('adminAuthApi.changePassword failed', e);
      rethrowApiError(e, 'Failed to change password.');
    }
  },
};

export const useChangeAdminPassword = () =>
  useMutation({
    mutationFn: ({currentPassword, newPassword}: {currentPassword: string; newPassword: string}) =>
      adminAuthApi.changePassword(currentPassword, newPassword),
  });
