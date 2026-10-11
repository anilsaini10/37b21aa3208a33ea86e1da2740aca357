/**
 * Transform interceptor — unwraps the standard `{ success, message, data }`
 * envelope so callers receive `data` directly, and normalises errors into a
 * consistent `ApiError` shape.
 */
import type {AxiosError, AxiosResponse} from 'axios';
import {notifyUnauthorized} from '../sessionEvents';

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export function transformResponseInterceptor(response: AxiosResponse): AxiosResponse {
  const body = response.data;
  if (body && typeof body === 'object' && 'data' in body && 'success' in body) {
    response.data = body.data;
  }
  return response;
}

export function transformErrorInterceptor(error: AxiosError): Promise<never> {
  const status = error.response?.status ?? 0;
  // Backend sends `{ success: false, error: { message, code } }`; also accept
  // a flat `{ message, code }` for endpoints that don't follow that shape.
  const payload = error.response?.data as
    | {
        message?: string;
        code?: string;
        error?: {message?: string; code?: string; details?: Record<string, unknown>};
      }
    | undefined;
  const apiError: ApiError = {
    status,
    message:
      payload?.error?.message ??
      payload?.message ??
      (status === 0 ? 'Network error. Please check your connection.' : 'Something went wrong.'),
    code: payload?.error?.code ?? payload?.code,
    details: payload?.error?.details,
  };
  // Token missing/expired — clear the session app-wide so the root navigator
  // swaps back to the login flow, instead of every screen handling this itself.
  if (status === 401) {
    notifyUnauthorized();
  }
  return Promise.reject(apiError);
}
