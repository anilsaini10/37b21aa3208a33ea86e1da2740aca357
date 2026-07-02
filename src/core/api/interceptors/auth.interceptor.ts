/**
 * Auth interceptor — attaches the bearer token to every outgoing request.
 */
import type {InternalAxiosRequestConfig} from 'axios';
import {storage, StorageKeys} from '../../storage/storage';

export function authRequestInterceptor(
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig {
  const token = storage.getString(StorageKeys.AUTH_TOKEN);
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
}
