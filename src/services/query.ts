import type { ApiResponse, PageResult } from '@/types/api';
import type { QueryListParams, QueryRecord, QuerySaveParams } from '@/types/query';
import {
  mockFetchQueryDetail,
  mockFetchQueryPage,
  mockSaveQueryRecord,
} from '@/mocks/query';

/**
 * 查询管理相关 API 请求封装。
 * 当前使用 mock 数据，后续接入真实后端时替换方法体。
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
  const data = await mockFetchQueryPage(params);
  return {
    code: 0,
    message: '获取成功',
    data,
  };
}

/**
 * 获取查询配置详情。
 * 对接后端 GET /api/query/detail
 */
export async function fetchQueryDetail(id: string): Promise<ApiResponse<QueryRecord | undefined>> {
  const data = await mockFetchQueryDetail(id);
  return {
    code: data ? 0 : 404,
    message: data ? '获取成功' : '查询配置不存在',
    data,
  };
}

/**
 * 保存查询配置。
 * 对接后端 POST /api/query/save
 */
export async function saveQueryRecord(
  params: QuerySaveParams,
): Promise<ApiResponse<QueryRecord>> {
  const data = await mockSaveQueryRecord(params);
  return {
    code: 0,
    message: '保存成功',
    data,
  };
}
