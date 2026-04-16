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
import {
  mockFetchSystemConfigs,
  mockFetchSystemDetail,
  mockFetchSystemMenuTree,
  mockFetchSystemPage,
  mockSaveSystemConfig,
  mockSaveSystemMenu,
  mockSaveSystemRecord,
  mockUpdateSystemMenuStatus,
  mockUpdateSystemStatus,
} from '@/mocks/system';

/**
 * 系统管理相关 API 请求封装。
 * 当前使用 mock 数据，后续接入真实后端时替换方法体。
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
  const data = await mockFetchSystemPage(params);
  return {
    code: 0,
    message: '获取成功',
    data,
  };
}

/**
 * 获取系统管理记录详情。
 * 对接后端 GET /api/system/detail
 */
export async function fetchSystemDetail(id: string): Promise<ApiResponse<SystemRecord | undefined>> {
  const data = await mockFetchSystemDetail(id);
  return {
    code: data ? 0 : 404,
    message: data ? '获取成功' : '记录不存在',
    data,
  };
}

/**
 * 保存系统管理记录。
 * 对接后端 POST /api/system/save
 */
export async function saveSystemRecord(
  params: SystemSaveParams,
): Promise<ApiResponse<SystemRecord>> {
  const data = await mockSaveSystemRecord(params);
  return {
    code: 0,
    message: '保存成功',
    data,
  };
}

/**
 * 更新系统管理记录状态。
 * 对接后端 POST /api/system/status
 */
export async function updateSystemStatus(
  id: string,
  status: SystemStatus,
): Promise<ApiResponse<SystemRecord | undefined>> {
  const data = await mockUpdateSystemStatus(id, status);
  return {
    code: data ? 0 : 404,
    message: data ? '状态已更新' : '记录不存在',
    data,
  };
}

/**
 * 获取菜单管理树形数据。
 * 对接后端 GET /api/system/menus/tree
 */
export async function fetchSystemMenuTree(params?: {
  keyword?: string;
  status?: SystemStatus;
}): Promise<ApiResponse<SystemMenuRecord[]>> {
  const data = await mockFetchSystemMenuTree(params);
  return {
    code: 0,
    message: '获取成功',
    data,
  };
}

/**
 * 保存菜单管理记录。
 * 对接后端 POST /api/system/menus/save
 */
export async function saveSystemMenu(
  params: SystemMenuSaveParams,
): Promise<ApiResponse<SystemMenuRecord>> {
  const data = await mockSaveSystemMenu(params);
  return {
    code: 0,
    message: '保存成功',
    data,
  };
}

/**
 * 更新菜单启停状态。
 * 对接后端 POST /api/system/menus/status
 */
export async function updateSystemMenuStatus(
  id: string,
  status: SystemStatus,
): Promise<ApiResponse<SystemMenuRecord | undefined>> {
  const data = await mockUpdateSystemMenuStatus(id, status);
  return {
    code: data ? 0 : 404,
    message: data ? '状态已更新' : '记录不存在',
    data,
  };
}

/**
 * 获取系统配置数据。
 * 对接后端 GET /api/system/configs
 */
export async function fetchSystemConfigs(): Promise<ApiResponse<SystemConfigRecord[]>> {
  const data = await mockFetchSystemConfigs();
  return {
    code: 0,
    message: '获取成功',
    data,
  };
}

/**
 * 保存系统配置项。
 * 对接后端 POST /api/system/configs/save
 */
export async function saveSystemConfig(
  id: string,
  value: SystemConfigRecord['value'],
): Promise<ApiResponse<SystemConfigRecord | undefined>> {
  const data = await mockSaveSystemConfig(id, value);
  return {
    code: data ? 0 : 404,
    message: data ? '配置已保存' : '配置不存在',
    data,
  };
}
