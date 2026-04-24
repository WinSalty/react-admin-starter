import type { ApiResponse, PageResult } from '@/types/api';
import type {
  PointAccount,
  PointAccountListParams,
  PointAdjustmentOrder,
  PointAdjustmentParams,
  PointFreezeOrder,
  PointLedgerListParams,
  PointLedgerRecord,
  PointRechargeOrder,
  PointReconciliation,
} from '@/types/points';
import { request } from '@/services/request';

/**
 * 积分模块 API 请求封装。
 * author: sunshengxian
 * 创建日期：2026-04-24
 */
export async function fetchPointAccount(): Promise<ApiResponse<PointAccount>> {
  const response = await request.get<ApiResponse<PointAccount>>('/api/points/account');
  return response.data;
}

export async function fetchPointLedger(
  params: PointLedgerListParams,
): Promise<ApiResponse<PageResult<PointLedgerRecord>>> {
  const response = await request.get<ApiResponse<PageResult<PointLedgerRecord>>>('/api/points/ledger', { params });
  return response.data;
}

export async function fetchPointRechargeOrders(
  params: PointLedgerListParams,
): Promise<ApiResponse<PageResult<PointRechargeOrder>>> {
  const response = await request.get<ApiResponse<PageResult<PointRechargeOrder>>>('/api/points/recharge/orders', {
    params,
  });
  return response.data;
}

export async function fetchPointConsumeOrders(
  params: PointLedgerListParams,
): Promise<ApiResponse<PageResult<PointLedgerRecord>>> {
  const response = await request.get<ApiResponse<PageResult<PointLedgerRecord>>>('/api/points/consume/orders', {
    params,
  });
  return response.data;
}

export async function fetchPointFreezeOrders(
  params: PointLedgerListParams,
): Promise<ApiResponse<PageResult<PointFreezeOrder>>> {
  const response = await request.get<ApiResponse<PageResult<PointFreezeOrder>>>('/api/points/freeze/orders', {
    params,
  });
  return response.data;
}

export async function fetchAdminPointAccounts(
  params: PointAccountListParams,
): Promise<ApiResponse<PageResult<PointAccount>>> {
  const response = await request.get<ApiResponse<PageResult<PointAccount>>>('/api/admin/points/accounts', { params });
  return response.data;
}

export async function fetchAdminPointLedger(
  params: PointLedgerListParams,
): Promise<ApiResponse<PageResult<PointLedgerRecord>>> {
  const response = await request.get<ApiResponse<PageResult<PointLedgerRecord>>>('/api/admin/points/ledger', {
    params,
  });
  return response.data;
}

export async function createPointAdjustment(
  params: PointAdjustmentParams,
): Promise<ApiResponse<PointAdjustmentOrder>> {
  const response = await request.post<ApiResponse<PointAdjustmentOrder>>('/api/admin/points/adjustments', params);
  return response.data;
}

export async function approvePointAdjustment(
  id: string,
  approved: boolean,
): Promise<ApiResponse<PointAdjustmentOrder>> {
  const response = await request.post<ApiResponse<PointAdjustmentOrder>>(
    `/api/admin/points/adjustments/${id}/approve`,
    { approved },
  );
  return response.data;
}

export async function fetchPointReconciliation(): Promise<ApiResponse<PointReconciliation>> {
  const response = await request.get<ApiResponse<PointReconciliation>>('/api/admin/points/reconciliation');
  return response.data;
}
