export interface CredentialExtractLink {
  id: string;
  linkNo: string;
  categoryId?: string;
  categoryName?: string;
  batchId?: string;
  batchNo?: string;
  batchName?: string;
  itemCount: number;
  maxAccessCount: number;
  accessedCount: number;
  remainingAccessCount: number;
  expireAt: string;
  status: string;
  createdBy?: string;
  disabledBy?: string;
  disabledAt?: string;
  lastAccessedAt?: string;
  remark?: string;
  copyable?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CredentialExtractLinkListParams {
  keyword?: string;
  categoryId?: string;
  batchId?: string;
  status?: string;
  createdBy?: string;
  expireFrom?: string;
  expireTo?: string;
  lastAccessFrom?: string;
  lastAccessTo?: string;
  pageNo?: number;
  pageSize?: number;
}

export interface CredentialExtractLinkCopyResult {
  id: string;
  linkNo: string;
  url: string;
}

export interface CredentialItem {
  id: string;
  batchId?: string;
  categoryId?: string;
  itemNo: string;
  secretMask: string;
  checksum?: string;
  sourceType: string;
  status: string;
  consumedUserId?: string;
  consumedAt?: string;
  consumeBizNo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CredentialExtractAccessRecord {
  id: string;
  accessNo: string;
  linkId?: string;
  batchId?: string;
  itemCount: number;
  success: boolean;
  failureReason?: string;
  clientIp?: string;
  userAgentHash?: string;
  browserFingerprint?: string;
  deviceSnapshot?: string;
  traceId?: string;
  createdAt: string;
}

export interface CredentialExtractAccessRecordListParams {
  success?: number;
  fingerprint?: string;
  pageNo?: number;
  pageSize?: number;
}
