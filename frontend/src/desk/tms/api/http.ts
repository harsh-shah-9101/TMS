import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { readSession, writeSession } from './session';

export const API_BASE = 'http://localhost:3000';

/** Every TMS call. Adds the bearer token and signs out on a permanent 401. */
export const http = axios.create({ baseURL: API_BASE });

let signedOut: () => void = () => undefined;

/** Called when session is gone. The caller (TmsLayout) redirects to login. */
export function onSignedOut(handler: () => void): void {
  signedOut = handler;
}

http.interceptors.request.use((config) => {
  const session = readSession();
  if (session) config.headers.Authorization = `Bearer ${session.accessToken}`;
  return config;
});

type RetryConfig = InternalAxiosRequestConfig & { tmsRetried?: boolean };

http.interceptors.response.use(undefined, async (error: AxiosError) => {
  const original = error.config as RetryConfig | undefined;
  const isAuthCall = original?.url?.includes('/auth/login') || original?.url?.includes('/auth/refresh');
  if (error.response?.status !== 401 || !original || original.tmsRetried || isAuthCall) throw error;
  // No refresh token support yet — just sign out immediately
  original.tmsRetried = true;
  writeSession(null);
  signedOut();
  throw error;
});
