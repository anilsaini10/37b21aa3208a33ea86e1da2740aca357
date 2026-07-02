/**
 * Configured Axios instance with the full interceptor chain wired in.
 *
 * Request:  auth token attached.
 * Response: envelope unwrapped; transient failures retried; errors normalised.
 */
import axios, {type AxiosInstance} from 'axios';
import {API_CONFIG} from './apiConfig';
import {
  authRequestInterceptor,
  attachRetryInterceptor,
  transformResponseInterceptor,
  transformErrorInterceptor,
} from './interceptors';

export function createAxiosClient(): AxiosInstance {
  const client = axios.create(API_CONFIG);

  client.interceptors.request.use(authRequestInterceptor);
  client.interceptors.response.use(transformResponseInterceptor, transformErrorInterceptor);
  attachRetryInterceptor(client);

  return client;
}

export const axiosClient = createAxiosClient();
