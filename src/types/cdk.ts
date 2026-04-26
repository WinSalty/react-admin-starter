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

export interface CdkExportResult {
  batchNo: string;
  count: number;
  fingerprint: string;
  fileName: string;
  fileType: string;
  content: string;
}

export interface CdkCode {
  id: string;
  batchId: string;
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
  batchId: string;
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
