import { request } from '@/services/request';
import type { ApiResponse, PageResult } from '@/types/api';
import type {
  CredentialBatch,
  CredentialBatchListParams,
  CredentialCategory,
  CredentialExtractLinkCreateRequest,
  CredentialExtractLinkCreateResult,
  CredentialExtractAccessRecord,
  CredentialExtractAccessRecordListParams,
  CredentialExtractLink,
  CredentialExtractLinkCopyResult,
  CredentialExtractLinkListParams,
  CredentialImportPreview,
  CredentialImportTask,
  CredentialImportTaskListParams,
  CredentialItem,
  CredentialItemListParams,
  CredentialPublicExtractResult,
  CredentialRedeemRecord,
  CredentialRedeemRecordListParams,
  CredentialRedeemResult,
} from '@/types/credential';

/**
 * 凭证中心 API 请求封装。
 * 当前阶段先接入提取链接管理，后续继续补充批次、明细和导入任务接口。
 * author: sunshengxian
 * 创建日期：2026-05-01
 */
export async function fetchCredentialExtractLinks(
  params: CredentialExtractLinkListParams,
): Promise<ApiResponse<PageResult<CredentialExtractLink>>> {
  const response = await request.get<ApiResponse<PageResult<CredentialExtractLink>>>('/api/admin/credentials/extract-links', { params });
  return response.data;
}

export async function fetchCredentialCategories(): Promise<ApiResponse<CredentialCategory[]>> {
  const response = await request.get<ApiResponse<CredentialCategory[]>>('/api/admin/credentials/categories');
  return response.data;
}

export async function createCredentialCategory(payload: Partial<CredentialCategory>): Promise<ApiResponse<CredentialCategory>> {
  const response = await request.post<ApiResponse<CredentialCategory>>('/api/admin/credentials/categories', payload);
  return response.data;
}

export async function fetchCredentialBatches(params: CredentialBatchListParams): Promise<ApiResponse<PageResult<CredentialBatch>>> {
  const response = await request.get<ApiResponse<PageResult<CredentialBatch>>>('/api/admin/credentials/batches', { params });
  return response.data;
}

export async function createGeneratedCredentialBatch(payload: {
  categoryId?: string;
  batchName?: string;
  totalCount: number;
  points: number;
  validFrom?: string;
  validTo?: string;
  remark?: string;
}): Promise<ApiResponse<CredentialBatch>> {
  const response = await request.post<ApiResponse<CredentialBatch>>('/api/admin/credentials/batches/generated', payload);
  return response.data;
}

export async function previewCredentialImport(payload: {
  categoryId?: string;
  rawText: string;
  delimiter: string;
  trimBlank?: boolean;
  batchDeduplicate?: boolean;
  globalDeduplicate?: boolean;
  caseSensitive?: boolean;
}): Promise<ApiResponse<CredentialImportPreview>> {
  const response = await request.post<ApiResponse<CredentialImportPreview>>('/api/admin/credentials/batches/imported/preview', payload);
  return response.data;
}

export async function confirmCredentialImport(payload: {
  categoryId?: string;
  batchName?: string;
  rawText: string;
  delimiter: string;
  validFrom?: string;
  validTo?: string;
  remark?: string;
  trimBlank?: boolean;
  batchDeduplicate?: boolean;
  globalDeduplicate?: boolean;
  caseSensitive?: boolean;
  createExtractLinks?: boolean;
  itemsPerLink?: number;
  maxAccessCount?: number;
  itemScope?: string;
  expireAt?: string;
}): Promise<ApiResponse<CredentialBatch>> {
  const response = await request.post<ApiResponse<CredentialBatch>>('/api/admin/credentials/batches/imported/confirm', payload);
  return response.data;
}

export async function disableCredentialBatch(id: string): Promise<ApiResponse<CredentialBatch>> {
  const response = await request.post<ApiResponse<CredentialBatch>>(`/api/admin/credentials/batches/${id}/disable`);
  return response.data;
}

export async function fetchCredentialBatchItems(id: string): Promise<ApiResponse<CredentialItem[]>> {
  const response = await request.get<ApiResponse<CredentialItem[]>>(`/api/admin/credentials/batches/${id}/items`);
  return response.data;
}

export async function createBatchCredentialExtractLinks(
  id: string,
  payload: CredentialExtractLinkCreateRequest,
): Promise<ApiResponse<CredentialExtractLinkCreateResult>> {
  const response = await request.post<ApiResponse<CredentialExtractLinkCreateResult>>(`/api/admin/credentials/batches/${id}/extract-links`, payload);
  return response.data;
}

export async function fetchCredentialItems(params: CredentialItemListParams): Promise<ApiResponse<PageResult<CredentialItem>>> {
  const response = await request.get<ApiResponse<PageResult<CredentialItem>>>('/api/admin/credentials/items', { params });
  return response.data;
}

export async function createItemCredentialExtractLink(
  id: string,
  payload: CredentialExtractLinkCreateRequest,
): Promise<ApiResponse<CredentialExtractLinkCreateResult>> {
  const response = await request.post<ApiResponse<CredentialExtractLinkCreateResult>>(`/api/admin/credentials/items/${id}/extract-links`, payload);
  return response.data;
}

export async function fetchCredentialItemExtractLinks(id: string): Promise<ApiResponse<CredentialExtractLink[]>> {
  const response = await request.get<ApiResponse<CredentialExtractLink[]>>(`/api/admin/credentials/items/${id}/extract-links`);
  return response.data;
}

export async function disableCredentialItem(id: string): Promise<ApiResponse<CredentialItem>> {
  const response = await request.post<ApiResponse<CredentialItem>>(`/api/admin/credentials/items/${id}/disable`);
  return response.data;
}

export async function enableCredentialItem(id: string): Promise<ApiResponse<CredentialItem>> {
  const response = await request.post<ApiResponse<CredentialItem>>(`/api/admin/credentials/items/${id}/enable`);
  return response.data;
}

export async function revealCredentialItem(id: string): Promise<ApiResponse<{ secretText: string }>> {
  const response = await request.post<ApiResponse<{ secretText: string }>>(`/api/admin/credentials/items/${id}/reveal`);
  return response.data;
}

export async function fetchCredentialImportTasks(
  params: CredentialImportTaskListParams,
): Promise<ApiResponse<PageResult<CredentialImportTask>>> {
  const response = await request.get<ApiResponse<PageResult<CredentialImportTask>>>('/api/admin/credentials/import-tasks', { params });
  return response.data;
}

export async function fetchCredentialRedeemRecords(
  params: CredentialRedeemRecordListParams,
): Promise<ApiResponse<PageResult<CredentialRedeemRecord>>> {
  const response = await request.get<ApiResponse<PageResult<CredentialRedeemRecord>>>('/api/admin/credentials/redeem-records', { params });
  return response.data;
}

export async function fetchCredentialExtractLink(id: string): Promise<ApiResponse<CredentialExtractLink>> {
  const response = await request.get<ApiResponse<CredentialExtractLink>>(`/api/admin/credentials/extract-links/${id}`);
  return response.data;
}

export async function fetchCredentialExtractLinkItems(id: string): Promise<ApiResponse<CredentialItem[]>> {
  const response = await request.get<ApiResponse<CredentialItem[]>>(`/api/admin/credentials/extract-links/${id}/items`);
  return response.data;
}

export async function fetchCredentialExtractAccessRecords(
  id: string,
  params: CredentialExtractAccessRecordListParams,
): Promise<ApiResponse<PageResult<CredentialExtractAccessRecord>>> {
  const response = await request.get<ApiResponse<PageResult<CredentialExtractAccessRecord>>>(
    `/api/admin/credentials/extract-links/${id}/access-records`,
    { params },
  );
  return response.data;
}

export async function copyCredentialExtractLinkUrl(id: string): Promise<ApiResponse<CredentialExtractLinkCopyResult>> {
  const response = await request.post<ApiResponse<CredentialExtractLinkCopyResult>>(`/api/admin/credentials/extract-links/${id}/copy-url`);
  return response.data;
}

export async function disableCredentialExtractLink(id: string, reason: string): Promise<ApiResponse<CredentialExtractLink>> {
  const response = await request.post<ApiResponse<CredentialExtractLink>>(`/api/admin/credentials/extract-links/${id}/disable`, { reason });
  return response.data;
}

export async function extendCredentialExtractLink(id: string, expireAt: string): Promise<ApiResponse<CredentialExtractLink>> {
  const response = await request.post<ApiResponse<CredentialExtractLink>>(`/api/admin/credentials/extract-links/${id}/extend`, { expireAt });
  return response.data;
}

export async function reissueCredentialExtractLink(
  id: string,
  payload: CredentialExtractLinkCreateRequest,
): Promise<ApiResponse<CredentialExtractLinkCopyResult>> {
  const response = await request.post<ApiResponse<CredentialExtractLinkCopyResult>>(`/api/admin/credentials/extract-links/${id}/reissue`, payload);
  return response.data;
}

export async function publicExtractCredential(
  token: string,
  payload: { browserFingerprint?: string; deviceSnapshot?: string },
): Promise<ApiResponse<CredentialPublicExtractResult>> {
  const response = await request.post<ApiResponse<CredentialPublicExtractResult>>(`/api/public/credentials/extract/${token}`, payload);
  return response.data;
}

export async function redeemCredential(payload: {
  secretText: string;
  idempotencyKey: string;
  deviceFingerprint?: string;
}): Promise<ApiResponse<CredentialRedeemResult>> {
  const response = await request.post<ApiResponse<CredentialRedeemResult>>('/api/credentials/redeem', payload);
  return response.data;
}
