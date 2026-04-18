export type NoticeStatus = 'active' | 'disabled' | 'draft' | 'expired';

export type NoticeType = 'system' | 'business' | 'security' | 'event';

export type NoticePriority = 'low' | 'medium' | 'high' | 'urgent';

export interface NoticeListParams {
  keyword?: string;
  status?: NoticeStatus;
  noticeType?: NoticeType;
  pageNo: number;
  pageSize: number;
}

export interface NoticeRecord {
  id: string;
  title: string;
  content: string;
  noticeType: NoticeType | string;
  priority: NoticePriority | string;
  publisherId: string;
  publisherName: string;
  publishTime: string;
  expireTime: string;
  status: NoticeStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface NoticeSaveParams {
  id?: string;
  title: string;
  content: string;
  noticeType: NoticeType | string;
  priority: NoticePriority | string;
  publisherId?: string;
  publishTime?: string;
  expireTime?: string;
  status: NoticeStatus;
  sortOrder?: number;
}

export interface NoticeStatusParams {
  id: string;
  status: NoticeStatus;
}
