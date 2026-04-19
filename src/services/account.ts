import type { ApiResponse } from '@/types/api';
import type {
  AccountNotificationSettings,
  AccountPasswordUpdateParams,
  AccountProfile,
  AccountProfileUpdateParams,
} from '@/types/account';
import { request } from '@/services/request';

/**
 * 个人设置相关 API 请求封装。
 * 对接后端认证模块中的当前用户资料、密码和通知设置接口。
 * author: sunshengxian
 * 创建日期：2026-04-19
 */
export async function fetchAccountProfile(): Promise<ApiResponse<AccountProfile>> {
  const response = await request.get<ApiResponse<AccountProfile>>('/api/auth/profile');
  return response.data;
}

export async function updateAccountProfile(
  params: AccountProfileUpdateParams,
): Promise<ApiResponse<AccountProfile>> {
  const response = await request.put<ApiResponse<AccountProfile>>('/api/auth/profile', params);
  return response.data;
}

export async function updateAccountPassword(
  params: AccountPasswordUpdateParams,
): Promise<ApiResponse<void>> {
  const response = await request.post<ApiResponse<void>>('/api/auth/password', params);
  return response.data;
}

export async function updateAccountNotifications(
  params: AccountNotificationSettings,
): Promise<ApiResponse<AccountProfile>> {
  const response = await request.put<ApiResponse<AccountProfile>>(
    '/api/auth/profile/notifications',
    params,
  );
  return response.data;
}
