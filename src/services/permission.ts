import type { ApiResponse } from '@/types/api';
import type { PermissionBootstrap } from '@/types/permission';
import { mockFetchPermissionBootstrap } from '@/mocks/permission';

/**
 * 权限相关 API 请求封装。
 * 当前使用 mock 数据，后续接入真实后端时替换方法体。
 * author: sunshengxian
 * 创建日期：2026-04-16
 */

/**
 * 一次性获取全部权限（菜单 + 路由 + 按钮）。
 * 对接后端 GET /api/permission/bootstrap
 */
export async function fetchPermissionBootstrap(
  role?: string,
): Promise<ApiResponse<PermissionBootstrap>> {
  // 后续替换为：return request.get('/api/permission/bootstrap', { params: { role } })
  const data = await mockFetchPermissionBootstrap((role as 'admin' | 'viewer') || 'admin');
  return {
    code: 0,
    message: '获取成功',
    data,
  };
}
