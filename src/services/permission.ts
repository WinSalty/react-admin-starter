import type { ApiResponse } from '@/types/api';
import type { PermissionBootstrap, RolePermissionAssignment } from '@/types/permission';
import { request } from '@/services/request';

/**
 * 权限相关 API 请求封装。
 * 统一对接后端权限接口。
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
  const response = await request.get<ApiResponse<PermissionBootstrap>>('/api/permission/bootstrap', {
    params: role ? { role } : undefined,
  });
  return response.data;
}

/**
 * 获取角色维度权限分配数据。
 * 对接后端 GET /api/permission/assignment
 */
export async function fetchPermissionAssignment(
  roleCode: string,
): Promise<ApiResponse<RolePermissionAssignment>> {
  const response = await request.get<ApiResponse<RolePermissionAssignment>>('/api/permission/assignment', {
    params: { roleCode },
  });
  return response.data;
}

/**
 * 保存角色维度权限分配。
 * 对接后端 POST /api/permission/assignment
 */
export async function savePermissionAssignment(
  params: RolePermissionAssignment,
): Promise<ApiResponse<RolePermissionAssignment>> {
  const response = await request.post<ApiResponse<RolePermissionAssignment>>(
    '/api/permission/assignment',
    params,
  );
  return response.data;
}
