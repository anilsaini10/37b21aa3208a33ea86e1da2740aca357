/**
 * Retry interceptor — retries idempotent requests on network / 5xx errors with
 * exponential backoff. Attached as a response error handler.
 */
import type {AxiosError, AxiosInstance, InternalAxiosRequestConfig} from 'axios';
import {logger} from '../../utils/logger';

interface RetryConfig extends InternalAxiosRequestConfig {
  _retryCount?: number;
}

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 500;
const RETRYABLE_METHODS = ['get', 'head', 'options'];

function isRetryable(error: AxiosError): boolean {
  const method = (error.config?.method ?? 'get').toLowerCase();
  if (!RETRYABLE_METHODS.includes(method)) {
    return false;
  }
  // Network error (no response) or server error.
  return !error.response || error.response.status >= 500;
}

export function attachRetryInterceptor(client: AxiosInstance): void {
  client.interceptors.response.use(
    response => response,
    async (error: AxiosError) => {
      const config = error.config as RetryConfig | undefined;
      if (!config || !isRetryable(error)) {
        return Promise.reject(error);
      }
      config._retryCount = (config._retryCount ?? 0) + 1;
      if (config._retryCount > MAX_RETRIES) {
        return Promise.reject(error);
      }
      const backoff = BASE_DELAY_MS * Math.pow(2, config._retryCount - 1);
      logger.warn(`Retry ${config._retryCount}/${MAX_RETRIES} after ${backoff}ms: ${config.url}`);
      await new Promise(res => setTimeout(res, backoff));
      return client(config);
    },
  );
}
