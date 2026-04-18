import { message } from 'antd';
import axios from 'axios';
import { refreshToken as requestRefreshToken } from '@/services/auth';
import { useAuthStore } from '@/stores/auth';
import { getRefreshToken, getToken } from '@/utils/token';
import type { ApiResponse } from '@/types/api';

export const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 10000,
});

const SUCCESS_CODE = 0;
const REFRESH_TOKEN_URL = '/api/auth/refresh-token';
let lastErrorMessage = '';
let lastErrorMessageAt = 0;

function isApiResponse(data: unknown): data is ApiResponse<unknown> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'code' in data &&
    'message' in data
  );
}

function showErrorMessage(content?: string): void {
  const text = content || '请求处理失败';
  const now = Date.now();
  if (text === lastErrorMessage && now - lastErrorMessageAt < 1200) {
    return;
  }
  lastErrorMessage = text;
  lastErrorMessageAt = now;
  message.error(text);
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (isApiResponse(data)) {
      return data.message;
    }
    return error.message || '请求处理失败';
  }
  return '请求处理失败';
}

function isRefreshTokenRequest(url?: string): boolean {
  return !!url && url.includes(REFRESH_TOKEN_URL);
}

/**
 * 请求拦截器：自动携带认证 token。
 * author: sunshengxian
 * 创建日期：2026-04-16
 */
request.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * 响应拦截器：统一处理后端业务失败提示和 401 未授权刷新。
 * author: sunshengxian
 * 创建日期：2026-04-16
 */
request.interceptors.response.use(
  (response) => {
    const data = response.data;
    if (isApiResponse(data) && data.code !== SUCCESS_CODE) {
      showErrorMessage(data.message);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !isRefreshTokenRequest(originalRequest?.url)
    ) {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        useAuthStore.getState().logout();
        showErrorMessage(getErrorMessage(error));
        return Promise.reject(error);
      }
      originalRequest._retry = true;
      try {
        const response = await requestRefreshToken(refreshToken);
        if (response.code !== SUCCESS_CODE) {
          useAuthStore.getState().logout();
          showErrorMessage(response.message);
          return Promise.reject(error);
        }
        const nextToken = response.data?.accessToken || response.data?.token;
        const nextRefreshToken = response.data?.refreshToken || refreshToken;
        if (!nextToken) {
          useAuthStore.getState().logout();
          showErrorMessage(response.message || '登录已过期，请重新登录');
          return Promise.reject(error);
        }
        useAuthStore.getState().updateTokens(nextToken, nextRefreshToken);
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${nextToken}`;
        return request(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        showErrorMessage(getErrorMessage(refreshError));
        return Promise.reject(refreshError);
      }
    }
    showErrorMessage(getErrorMessage(error));
    return Promise.reject(error);
  },
);
