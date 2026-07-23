/**
 * Parent's own password change — real backend, `/api/students/reset-password`
 * (the parent portal's backend routes all live under `/api/students`, not `/api/parent`).
 *
 * On success the backend revokes refresh tokens on every OTHER session — this
 * device's session stays logged in. A wrong current password comes back as
 * 401/403; normalised here to a stable `INVALID_CURRENT_PASSWORD` code so the
 * screen can highlight just that field regardless of the exact backend code.
 */
import {useMutation} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {apiError, rethrowApiError} from '../../core/api/apiError';

export const parentAuthApi = {
  changePassword: async (currentPassword: string, newPassword: string): Promise<{message: string}> => {
    try {
      const {data} = await axiosClient.post<{message: string}>(Endpoints.students.resetPassword, {
        currentPassword,
        newPassword,
      });
      return data;
    } catch (e) {
      console.error('parentAuthApi.changePassword failed', e);
      const status = (e as {status?: number} | undefined)?.status;
      if (status === 401 || status === 403) {
        throw apiError('Current password is incorrect.', 'INVALID_CURRENT_PASSWORD');
      }
      rethrowApiError(e, 'Failed to change password.');
    }
  },
};

export const useChangeParentPassword = () =>
  useMutation({
    mutationFn: ({currentPassword, newPassword}: {currentPassword: string; newPassword: string}) =>
      parentAuthApi.changePassword(currentPassword, newPassword),
  });
