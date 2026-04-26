import type { ApiResponse, PageResult } from '@/types/api';
import type {
  CdkBatch,
  CdkBatchCreateParams,
  CdkBatchListParams,
  CdkCode,
  CdkCodeListParams,
  CdkExportResult,
  CdkRedeemRecord,
  CdkRedeemRecordListParams,
  CdkRedeemResult,
} from '@/types/cdk';
import { request } from '@/services/request';

/**
 * CDK 模块 API 请求封装。
 * author: sunshengxian
 * 创建日期：2026-04-24
 */
export async function fetchCdkBatches(params: CdkBatchListParams): Promise<ApiResponse<PageResult<CdkBatch>>> {
  const response = await request.get<ApiResponse<PageResult<CdkBatch>>>('/api/admin/cdk/batches', { params });
  return response.data;
}

export async function createCdkBatch(params: CdkBatchCreateParams): Promise<ApiResponse<CdkBatch>> {
  const response = await request.post<ApiResponse<CdkBatch>>('/api/admin/cdk/batches', params);
  return response.data;
}

export async function pauseCdkBatch(id: string): Promise<ApiResponse<CdkBatch>> {
  const response = await request.post<ApiResponse<CdkBatch>>(`/api/admin/cdk/batches/${id}/pause`);
  return response.data;
}

export async function voidCdkBatch(id: string): Promise<ApiResponse<CdkBatch>> {
  const response = await request.post<ApiResponse<CdkBatch>>(`/api/admin/cdk/batches/${id}/void`);
  return response.data;
}

export async function exportCdkBatch(id: string): Promise<ApiResponse<CdkExportResult>> {
  const response = await request.post<ApiResponse<CdkExportResult>>(`/api/admin/cdk/batches/${id}/export`);
  return response.data;
}

export async function fetchCdkCodes(params: CdkCodeListParams): Promise<ApiResponse<PageResult<CdkCode>>> {
  const response = await request.get<ApiResponse<PageResult<CdkCode>>>('/api/admin/cdk/codes', { params });
  return response.data;
}

export async function updateCdkCodeStatus(id: string, status: string): Promise<ApiResponse<CdkCode>> {
  const response = await request.post<ApiResponse<CdkCode>>(`/api/admin/cdk/codes/${id}/status`, { status });
  return response.data;
}

export async function redeemCdk(cdk: string, idempotencyKey: string): Promise<ApiResponse<CdkRedeemResult>> {
  const response = await request.post<ApiResponse<CdkRedeemResult>>('/api/points/cdk/redeem', {
    cdk,
    idempotencyKey,
  });
  return response.data;
}

export async function fetchCdkRedeemRecords(
  params: CdkRedeemRecordListParams,
): Promise<ApiResponse<PageResult<CdkRedeemRecord>>> {
  const response = await request.get<ApiResponse<PageResult<CdkRedeemRecord>>>('/api/admin/cdk/redeem-records', {
    params,
  });
  return response.data;
}
