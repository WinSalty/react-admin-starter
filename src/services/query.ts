import type { ApiResponse, PageResult } from '@/types/api';
import type { QueryListParams, QueryRecord, QuerySaveParams } from '@/types/query';
import { request } from '@/services/request';

/**
 * 查询管理相关 API 请求封装。
 * 统一对接后端查询管理接口。
 * author: sunshengxian
 * 创建日期：2026-04-16
 */

/**
 * 分页获取查询配置列表。
 * 对接后端 GET /api/query/list
 */
export async function fetchQueryPage(
  params: QueryListParams,
): Promise<ApiResponse<PageResult<QueryRecord>>> {
  const response = await request.get<ApiResponse<PageResult<QueryRecord>>>('/api/query/list', {
    params,
  });
  return response.data;
}

/**
 * 获取查询配置详情。
 * 对接后端 GET /api/query/detail
 */
export async function fetchQueryDetail(id: string): Promise<ApiResponse<QueryRecord | undefined>> {
  const response = await request.get<ApiResponse<QueryRecord>>('/api/query/detail', {
    params: { id },
  });
  return response.data;
}

/**
 * 保存查询配置。
 * 对接后端 POST /api/query/save
 */
export async function saveQueryRecord(
  params: QuerySaveParams,
): Promise<ApiResponse<QueryRecord>> {
  const response = await request.post<ApiResponse<QueryRecord>>('/api/query/save', params);
  return response.data;
}
