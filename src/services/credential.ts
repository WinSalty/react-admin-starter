import { request } from '@/services/request';
import type { ApiResponse, PageResult } from '@/types/api';
import type {
  CredentialExtractAccessRecord,
  CredentialExtractAccessRecordListParams,
  CredentialExtractLink,
  CredentialExtractLinkCopyResult,
  CredentialExtractLinkListParams,
  CredentialItem,
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
