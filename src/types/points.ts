export interface PointAccount {
  id: string;
  userId: string;
  username?: string;
  nickname?: string;
  availablePoints: number;
  frozenPoints: number;
  totalEarnedPoints: number;
  totalSpentPoints: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PointLedgerRecord {
  id: string;
  ledgerNo: string;
  userId: string;
  accountId: string;
  direction: 'earn' | 'spend' | 'freeze' | 'unfreeze' | 'refund';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  frozenBefore: number;
  frozenAfter: number;
  bizType: string;
  bizNo: string;
  operatorType: string;
  operatorId: string;
  traceId: string;
  entryHash: string;
  remark?: string;
  createdAt: string;
}

export interface PointRechargeOrder {
  id: string;
  rechargeNo: string;
  userId: string;
  channel: string;
  amount: number;
  status: string;
  externalNo: string;
  createdAt: string;
  updatedAt: string;
}

export interface PointFreezeOrder {
  id: string;
  freezeNo: string;
  userId: string;
  amount: number;
  bizType: string;
  bizNo: string;
  status: string;
  expireAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PointReconciliation {
  checkedAccounts: number;
  differentAccounts: number;
  totalAvailableDiff: number;
  totalFrozenDiff: number;
  checkedAt: string;
}

export interface PointAdjustmentOrder {
  id: string;
  adjustNo: string;
  userId: string;
  direction: 'earn' | 'spend';
  amount: number;
  status: string;
  reason: string;
  ticketNo: string;
  applicant: string;
  approver?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PointLedgerListParams {
  userId?: string;
  direction?: string;
  bizType?: string;
  bizNo?: string;
  pageNo?: number;
  pageSize?: number;
}

export interface PointAccountListParams {
  keyword?: string;
  status?: string;
  pageNo?: number;
  pageSize?: number;
}

export interface PointAdjustmentParams {
  userId: string;
  direction: 'earn' | 'spend';
  amount: number;
  reason: string;
  ticketNo: string;
  idempotencyKey: string;
}
