import type { ApiResponse } from '@/types/api';
import { mockLogin, mockRegister } from '@/mocks/auth';

export interface LoginParams {
  username: string;
  password: string;
}

export interface RegisterParams {
  username: string;
  email: string;
  password: string;
}

export interface LoginResult {
  token: string;
}

/**
 * 认证相关 API 请求封装。
 * 当前使用 mock 数据，后续接入真实后端时替换方法体。
 * author: sunshengxian
 * 创建日期：2026-04-16
 */

/**
 * 用户登录。
 */
export async function login(params: LoginParams): Promise<ApiResponse<LoginResult>> {
  return mockLogin(params);
}

/**
 * 用户注册。
 */
export async function register(params: RegisterParams): Promise<ApiResponse<void>> {
  return mockRegister(params);
}
