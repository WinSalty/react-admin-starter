import type { ApiResponse } from '@/types/api';
import type { PermissionBootstrap, RolePermissionAssignment } from '@/types/permission';
import {
  mockFetchPermissionAssignment,
  mockFetchPermissionBootstrap,
  mockSavePermissionAssignment,
} from '@/mocks/permission';

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

/**
 * 获取角色维度权限分配数据。
 * 对接后端 GET /api/permission/assignment
 */
export async function fetchPermissionAssignment(
  roleCode: string,
): Promise<ApiResponse<RolePermissionAssignment>> {
  const data = await mockFetchPermissionAssignment(roleCode);
  return {
    code: 0,
    message: '获取成功',
    data,
  };
}

/**
 * 保存角色维度权限分配。
 * 对接后端 POST /api/permission/assignment
 */
export async function savePermissionAssignment(
  params: RolePermissionAssignment,
): Promise<ApiResponse<RolePermissionAssignment>> {
  const data = await mockSavePermissionAssignment(params);
  return {
    code: 0,
    message: '保存成功',
    data,
  };
}
