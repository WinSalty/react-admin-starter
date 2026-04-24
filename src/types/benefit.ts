export interface BenefitProduct {
  id: string;
  productNo: string;
  productName: string;
  benefitType: string;
  benefitCode: string;
  benefitName: string;
  benefitConfig?: string;
  costPoints: number;
  stockTotal: number;
  stockUsed: number;
  validFrom: string;
  validTo: string;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BenefitProductListParams {
  keyword?: string;
  status?: string;
  pageNo?: number;
  pageSize?: number;
}

export interface BenefitProductSaveParams {
  productName: string;
  benefitType: string;
  benefitCode: string;
  benefitName: string;
  benefitConfig?: string;
  costPoints: number;
  stockTotal: number;
  validFrom: string;
  validTo: string;
}

export interface BenefitExchangeOrder {
  id: string;
  orderNo: string;
  userId: string;
  productNo: string;
  benefitType: string;
  benefitCode: string;
  costPoints: number;
  freezeNo: string;
  status: string;
  failureMessage: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserBenefit {
  id: string;
  benefitType: string;
  benefitCode: string;
  benefitName: string;
  sourceType: string;
  sourceNo: string;
  status: string;
  effectiveAt: string;
  expireAt?: string;
  createdAt: string;
}
