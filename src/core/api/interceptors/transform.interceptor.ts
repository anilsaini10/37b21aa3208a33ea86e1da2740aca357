/**
 * Transform interceptor — unwraps the standard `{ success, message, data }`
 * envelope so callers receive `data` directly, and normalises errors into a
 * consistent `ApiError` shape.
 */
import type {AxiosError, AxiosResponse} from 'axios';

export interface ApiError {
  status: number;
  message: string;
  code?: string;
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
    | {message?: string; code?: string; error?: {message?: string; code?: string}}
    | undefined;
  const apiError: ApiError = {
    status,
    message:
      payload?.error?.message ??
      payload?.message ??
      (status === 0 ? 'Network error. Please check your connection.' : 'Something went wrong.'),
    code: payload?.error?.code ?? payload?.code,
  };
  return Promise.reject(apiError);
}
