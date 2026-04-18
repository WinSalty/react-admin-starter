import type { ApiResponse } from '@/types/api';
import type { DashboardOverview } from '@/types/dashboard';
import { request } from '@/services/request';

/**
 * Dashboard 相关 API 请求封装。
 * 统一对接后端工作台接口。
 * author: sunshengxian
 * 创建日期：2026-04-16
 */

/**
 * 获取 Dashboard 首页概览数据。
 * 对接后端 GET /api/dashboard/overview
 */
export async function fetchDashboardOverview(): Promise<ApiResponse<DashboardOverview>> {
  const response = await request.get<ApiResponse<DashboardOverview>>('/api/dashboard/overview');
  return response.data;
}
