import type { ApiResponse, PageResult } from '@/types/api';
import type { NoticeListParams, NoticeRecord, NoticeSaveParams, NoticeStatus } from '@/types/notice';
import { request } from '@/services/request';

/**
 * 公告管理相关 API 请求封装。
 * author: sunshengxian
 * 创建日期：2026-04-18
 */
export async function fetchNoticePage(
  params: NoticeListParams,
): Promise<ApiResponse<PageResult<NoticeRecord>>> {
  const response = await request.get<ApiResponse<PageResult<NoticeRecord>>>('/api/system/notices/list', {
    params,
  });
  return response.data;
}

export async function fetchNoticeDetail(id: string): Promise<ApiResponse<NoticeRecord>> {
  const response = await request.get<ApiResponse<NoticeRecord>>('/api/system/notices/detail', {
    params: { id },
  });
  return response.data;
}

export async function saveNotice(params: NoticeSaveParams): Promise<ApiResponse<NoticeRecord>> {
  const response = await request.post<ApiResponse<NoticeRecord>>('/api/system/notices/save', params);
  return response.data;
}

export async function updateNoticeStatus(
  id: string,
  status: NoticeStatus,
): Promise<ApiResponse<NoticeRecord>> {
  const response = await request.post<ApiResponse<NoticeRecord>>('/api/system/notices/status', {
    id,
    status,
  });
  return response.data;
}

export async function fetchActiveNotices(): Promise<ApiResponse<NoticeRecord[]>> {
  const response = await request.get<ApiResponse<NoticeRecord[]>>('/api/system/notices/active');
  return response.data;
}
