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

export interface CredentialCategory {
  id: string;
  categoryCode: string;
  categoryName: string;
  fulfillmentType: string;
  generationMode: string;
  payloadSchema?: string;
  importConfig?: string;
  extractPolicy?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CredentialBatch {
  id: string;
  batchNo: string;
  batchName: string;
  categoryId: string;
  categoryCode?: string;
  categoryName?: string;
  fulfillmentType: string;
  generationMode: string;
  payloadConfig?: string;
  totalCount: number;
  availableCount: number;
  consumedCount: number;
  linkedCount: number;
  validFrom: string;
  validTo: string;
  status: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CredentialBatchListParams {
  keyword?: string;
  categoryId?: string;
  fulfillmentType?: string;
  generationMode?: string;
  status?: string;
  pageNo?: number;
  pageSize?: number;
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

export interface CredentialItemListParams {
  keyword?: string;
  batchId?: string;
  categoryId?: string;
  sourceType?: string;
  status?: string;
  pageNo?: number;
  pageSize?: number;
}

export interface CredentialImportPreviewItem {
  lineNo: number;
  secretMask: string;
  status: string;
  message: string;
}

export interface CredentialImportPreview {
  totalRows: number;
  validRows: number;
  duplicateRows: number;
  invalidRows: number;
  importHash: string;
  previews: CredentialImportPreviewItem[];
  duplicateMessages: string[];
  invalidMessages: string[];
}

export interface CredentialImportTask {
  id: string;
  taskNo: string;
  batchId?: string;
  categoryId: string;
  categoryName?: string;
  delimiter: string;
  totalRows: number;
  validRows: number;
  duplicateRows: number;
  invalidRows: number;
  importHash: string;
  resultSummary?: string;
  status: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CredentialImportTaskListParams {
  categoryId?: string;
  batchId?: string;
  status?: string;
  pageNo?: number;
  pageSize?: number;
}

export interface CredentialRedeemRecord {
  id: string;
  recordNo: string;
  itemId?: string;
  batchId?: string;
  categoryId?: string;
  userId: string;
  points: number;
  idempotencyKey: string;
  clientIp?: string;
  userAgentHash?: string;
  deviceFingerprint?: string;
  ledgerNo?: string;
  status: string;
  failureReason?: string;
  createdAt: string;
}

export interface CredentialRedeemRecordListParams {
  userId?: string;
  batchId?: string;
  status?: string;
  pageNo?: number;
  pageSize?: number;
}

export interface CredentialExtractLinkCreateRequest {
  itemsPerLink: number;
  maxAccessCount: number;
  expireAt?: string;
  itemScope?: string;
  remark?: string;
}

export interface CredentialExtractLinkCreateResult {
  linkCount: number;
  itemCount: number;
  links: CredentialExtractLinkCopyResult[];
}

export interface CredentialPublicExtractItem {
  itemNo: string;
  secretText: string;
  copyLabel: string;
}

export interface CredentialPublicExtractResult {
  linkNo: string;
  categoryName: string;
  fulfillmentType: string;
  batchName: string;
  remainingAccessCount: number;
  expireAt: string;
  items: CredentialPublicExtractItem[];
}

export interface CredentialRedeemResult {
  recordNo: string;
  itemNo?: string;
  points: number;
  ledgerNo?: string;
  status: string;
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
