import { request } from '@/services/request';
import type { ApiResponse, PageResult } from '@/types/api';
import type { RiskAlert, RiskAlertListParams } from '@/types/risk';

export async function fetchRiskAlerts(params: RiskAlertListParams): Promise<ApiResponse<PageResult<RiskAlert>>> {
  const response = await request.get<ApiResponse<PageResult<RiskAlert>>>('/api/admin/risk-alerts', { params });
  return response.data;
}
