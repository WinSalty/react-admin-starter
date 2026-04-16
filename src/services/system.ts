import type { ApiResponse, PageResult } from '@/types/api';
import type { SystemListParams, SystemRecord, SystemSaveParams, SystemStatus } from '@/types/system';
import {
  mockFetchSystemDetail,
  mockFetchSystemPage,
  mockSaveSystemRecord,
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
