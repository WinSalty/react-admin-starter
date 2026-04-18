import type { ApiResponse } from '@/types/api';
import { request } from '@/services/request';

export interface LoginParams {
  username: string;
  password: string;
}

export interface RegisterParams {
  username: string;
  email: string;
  verifyCode: string;
  password: string;
}

export interface LoginResult {
  token: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  refreshExpiresIn?: number;
  tokenType?: string;
  roleCode?: string;
  roleName?: string;
}

/**
 * 认证相关 API 请求封装。
 * 统一对接后端认证接口。
 * author: sunshengxian
 * 创建日期：2026-04-16
 */

/**
 * 用户登录。
 */
export async function login(params: LoginParams): Promise<ApiResponse<LoginResult>> {
  const response = await request.post<ApiResponse<LoginResult>>('/api/auth/login', params);
  return response.data;
}

/**
 * 刷新访问令牌。
 */
export async function refreshToken(refreshToken: string): Promise<ApiResponse<LoginResult>> {
  const response = await request.post<ApiResponse<LoginResult>>('/api/auth/refresh-token', {
    refreshToken,
  });
  return response.data;
}

/**
 * 用户注册。
 */
export async function register(params: RegisterParams): Promise<ApiResponse<void>> {
  const response = await request.post<ApiResponse<void>>('/api/auth/register', params);
  return response.data;
}

/**
 * 发送注册邮箱验证码。
 */
export async function sendRegisterVerifyCode(email: string): Promise<ApiResponse<string>> {
  const response = await request.get<ApiResponse<string>>('/api/auth/register/verify-code', {
    params: { email },
  });
  return response.data;
}
