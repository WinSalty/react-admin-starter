export interface RiskAlert {
  id: string;
  alertNo: string;
  alertType: string;
  riskLevel: string;
  subjectType: string;
  subjectNo: string;
  userId?: number;
  status: string;
  detailSnapshot?: string;
  handledBy?: string;
  handledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RiskAlertListParams {
  alertType?: string;
  status?: string;
  pageNo?: number;
  pageSize?: number;
}
