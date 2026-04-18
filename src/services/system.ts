import type { ApiResponse, PageResult } from '@/types/api';
import type {
  SystemConfigRecord,
  SystemListParams,
  SystemMenuRecord,
  SystemMenuSaveParams,
  SystemRecord,
  SystemSaveParams,
  SystemStatus,
} from '@/types/system';
import { request } from '@/services/request';

/**
 * 系统管理相关 API 请求封装。
 * 统一对接后端系统管理接口。
 * author: sunshengxian
 * 创建日期：2026-04-17
 */

/**
 * 分页获取系统管理模块列表。
 * 对接后端 GET /api/system/{moduleKey}/list
 */
export async function fetchSystemPage(
  params: SystemListParams,
): Promise<ApiResponse<PageResult<SystemRecord>>> {
  const { moduleKey, ...queryParams } = params;
  const response = await request.get<ApiResponse<PageResult<SystemRecord>>>(
    `/api/system/${moduleKey}/list`,
    { params: queryParams },
  );
  return response.data;
}

/**
 * 获取系统管理记录详情。
 * 对接后端 GET /api/system/detail
 */
export async function fetchSystemDetail(id: string): Promise<ApiResponse<SystemRecord | undefined>> {
  const response = await request.get<ApiResponse<SystemRecord>>('/api/system/detail', {
    params: { id },
  });
  return response.data;
}

/**
 * 保存系统管理记录。
 * 对接后端 POST /api/system/save
 */
export async function saveSystemRecord(
  params: SystemSaveParams,
): Promise<ApiResponse<SystemRecord>> {
  const response = await request.post<ApiResponse<SystemRecord>>('/api/system/save', params);
  return response.data;
}

/**
 * 更新系统管理记录状态。
 * 对接后端 POST /api/system/status
 */
export async function updateSystemStatus(
  id: string,
  status: SystemStatus,
): Promise<ApiResponse<SystemRecord | undefined>> {
  const response = await request.post<ApiResponse<SystemRecord>>('/api/system/status', {
    id,
    status,
  });
  return response.data;
}

/**
 * 获取菜单管理树形数据。
 * 对接后端 GET /api/system/menus/tree
 */
export async function fetchSystemMenuTree(params?: {
  keyword?: string;
  status?: SystemStatus;
}): Promise<ApiResponse<SystemMenuRecord[]>> {
  const response = await request.get<ApiResponse<SystemMenuRecord[]>>('/api/system/menus/tree', {
    params,
  });
  return response.data;
}

/**
 * 保存菜单管理记录。
 * 对接后端 POST /api/system/menus/save
 */
export async function saveSystemMenu(
  params: SystemMenuSaveParams,
): Promise<ApiResponse<SystemMenuRecord>> {
  const response = await request.post<ApiResponse<SystemMenuRecord>>('/api/system/menus/save', params);
  return response.data;
}

/**
 * 更新菜单启停状态。
 * 对接后端 POST /api/system/menus/status
 */
export async function updateSystemMenuStatus(
  id: string,
  status: SystemStatus,
): Promise<ApiResponse<SystemMenuRecord | undefined>> {
  const response = await request.post<ApiResponse<SystemMenuRecord>>('/api/system/menus/status', {
    id,
    status,
  });
  return response.data;
}

/**
 * 获取系统配置数据。
 * 对接后端 GET /api/system/configs
 */
export async function fetchSystemConfigs(): Promise<ApiResponse<SystemConfigRecord[]>> {
  const response = await request.get<ApiResponse<SystemConfigRecord[]>>('/api/system/configs');
  return response.data;
}

/**
 * 保存系统配置项。
 * 对接后端 POST /api/system/configs/save
 */
export async function saveSystemConfig(
  id: string,
  value: SystemConfigRecord['value'],
): Promise<ApiResponse<SystemConfigRecord | undefined>> {
  const response = await request.post<ApiResponse<SystemConfigRecord>>('/api/system/configs/save', {
    id,
    value,
  });
  return response.data;
}
