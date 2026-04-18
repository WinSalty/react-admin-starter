import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { getToken } from '@/utils/token';

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
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);
