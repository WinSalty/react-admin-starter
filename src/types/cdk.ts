export interface CdkBatch {
  id: string;
  batchNo: string;
  batchName: string;
  benefitType: string;
  benefitConfig: string;
  totalCount: number;
  generatedCount: number;
  redeemedCount: number;
  validFrom: string;
  validTo: string;
  status: string;
  riskLevel: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
  secondApprovedBy?: string;
  secondApprovedAt?: string;
  exportCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CdkBatchListParams {
  keyword?: string;
  status?: string;
  benefitType?: string;
  pageNo?: number;
  pageSize?: number;
}

export interface CdkBatchCreateParams {
  batchName: string;
  benefitType: 'points';
  points: number;
  totalCount: number;
  validFrom: string;
  validTo: string;
  riskLevel: string;
  remark?: string;
}

export interface CdkCode {
  id: string;
  batchId: string;
  batchNo?: string;
  batchName?: string;
  benefitType?: string;
  benefitConfig?: string;
  batchStatus?: string;
  validFrom?: string;
  validTo?: string;
  cdk: string;
  codePrefix: string;
  checksum: string;
  status: string;
  redeemedUserId?: string;
  redeemedAt?: string;
  redeemRecordNo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CdkCodeListParams {
  keyword?: string;
  batchId?: string;
  status?: string;
  pageNo?: number;
  pageSize?: number;
}

export interface CdkRedeemRecord {
  id: string;
  redeemNo: string;
  userId: string;
  batchId: string;
  codeId: string;
  benefitType: string;
  benefitSnapshot: string;
  status: string;
  failureCode: string;
  failureMessage: string;
  clientIp: string;
  traceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CdkRedeemRecordListParams {
  userId?: string;
  batchId?: string;
  status?: string;
  pageNo?: number;
  pageSize?: number;
}

export interface CdkRedeemResult {
  redeemNo: string;
  benefitType: string;
  grantedPoints: number;
  availablePoints: number;
  frozenPoints: number;
  status: string;
}

export interface DeviceSnapshot {
  platform?: string;
  language?: string;
  timezone?: string;
  screen?: string;
  colorDepth?: number;
  deviceMemory?: number;
  hardwareConcurrency?: number;
  touchPoints?: number;
}

export interface CdkExtractLink {
  id: string;
  linkNo: string;
  codeId: string;
  batchId: string;
  url?: string;
  maxAccessCount: number;
  accessedCount: number;
  remainingAccessCount: number;
  expireAt: string;
  status: string;
  createdBy: string;
  disabledBy?: string;
  disabledAt?: string;
  remark?: string;
  lastAccessedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CdkExtractLinkCreateParams {
  maxAccessCount: number;
  expireAt: string;
  codesPerLink?: number;
  remark?: string;
}

export interface CdkBatchExtractLinkResult {
  batchId: string;
  batchNo: string;
  batchName: string;
  generatedCount: number;
  codeCount: number;
  skippedCount: number;
  links: CdkExtractLink[];
}

export interface CdkExtractAccessRecord {
  id: string;
  accessNo: string;
  linkId: string;
  codeId: string;
  batchId: string;
  result: string;
  failureCode: string;
  failureMessage: string;
  clientIp: string;
  userAgentHash: string;
  browserFingerprint: string;
  deviceSnapshot: string;
  referer: string;
  traceId: string;
  createdAt: string;
}

export interface CdkExtractAccessRecordListParams {
  result?: string;
  fingerprint?: string;
  pageNo?: number;
  pageSize?: number;
}

export interface CdkExtractView {
  cdk: string;
  cdks?: string[];
  cdkCount?: number;
  batchName: string;
  benefitType: string;
  benefitText: string;
  validTo: string;
  remainingAccessCount: number;
  status: string;
}
