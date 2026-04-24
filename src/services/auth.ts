import type { ApiResponse } from '@/types/api';
import { request } from '@/services/request';

export interface LoginParams {
  username: string;
  password: string;
}

export interface RegisterParams {
  username: string;
  email: string;
  password: string;
}

export interface RegisterVerifyLinkParams {
  email: string;
  token: string;
}

export interface RegisterResendVerifyMailParams {
  email: string;
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
 * 验证注册邮箱链接。
 */
export async function verifyRegisterEmail(
  params: RegisterVerifyLinkParams,
): Promise<ApiResponse<void>> {
  const response = await request.post<ApiResponse<void>>('/api/auth/register/verify-link', params);
  return response.data;
}

/**
 * 重发注册邮箱验证邮件。
 */
export async function resendRegisterVerifyMail(
  params: RegisterResendVerifyMailParams,
): Promise<ApiResponse<void>> {
  const response = await request.post<ApiResponse<void>>('/api/auth/register/resend-verify-mail', params);
  return response.data;
}
