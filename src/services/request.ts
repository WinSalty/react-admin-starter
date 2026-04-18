import axios from 'axios';
import { refreshToken as requestRefreshToken } from '@/services/auth';
import { useAuthStore } from '@/stores/auth';
import { getRefreshToken, getToken, setRefreshToken, setToken } from '@/utils/token';

export const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 10000,
});

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
 * 响应拦截器：统一处理 401 未授权。
 * author: sunshengxian
 * 创建日期：2026-04-16
 */
request.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest?._retry) {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }
      originalRequest._retry = true;
      try {
        const response = await requestRefreshToken(refreshToken);
        const nextToken = response.data?.accessToken || response.data?.token;
        const nextRefreshToken = response.data?.refreshToken || refreshToken;
        if (!nextToken) {
          useAuthStore.getState().logout();
          return Promise.reject(error);
        }
        setToken(nextToken);
        setRefreshToken(nextRefreshToken);
        useAuthStore.getState().login(nextToken, nextRefreshToken, useAuthStore.getState().role);
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${nextToken}`;
        return request(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);
