import type { ApiResponse } from '@/types/api';
import type { DashboardOverview } from '@/types/dashboard';
import { mockFetchDashboardOverview } from '@/mocks/dashboard';

/**
 * Dashboard 相关 API 请求封装。
 * 当前使用 mock 数据，后续接入真实后端时替换方法体。
 * author: sunshengxian
 * 创建日期：2026-04-16
 */

/**
 * 获取 Dashboard 首页概览数据。
 * 对接后端 GET /api/dashboard/overview
 */
export async function fetchDashboardOverview(): Promise<ApiResponse<DashboardOverview>> {
  const data = await mockFetchDashboardOverview();
  return {
    code: 0,
    message: '获取成功',
    data,
  };
}
