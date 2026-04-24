import { request } from '@/services/request';
import type { ApiResponse, PageResult } from '@/types/api';
import type {
  BenefitExchangeOrder,
  BenefitProduct,
  BenefitProductListParams,
  BenefitProductSaveParams,
  UserBenefit,
} from '@/types/benefit';

export async function fetchBenefitProducts(params: BenefitProductListParams): Promise<ApiResponse<PageResult<BenefitProduct>>> {
  const response = await request.get<ApiResponse<PageResult<BenefitProduct>>>('/api/benefits/products', { params });
  return response.data;
}

export async function exchangeBenefitProduct(id: string, idempotencyKey: string): Promise<ApiResponse<BenefitExchangeOrder>> {
  const response = await request.post<ApiResponse<BenefitExchangeOrder>>(`/api/benefits/products/${id}/exchange`, {
    idempotencyKey,
  });
  return response.data;
}

export async function fetchMyBenefits(params: { pageNo?: number; pageSize?: number }): Promise<ApiResponse<PageResult<UserBenefit>>> {
  const response = await request.get<ApiResponse<PageResult<UserBenefit>>>('/api/benefits/mine', { params });
  return response.data;
}

export async function fetchAdminBenefitProducts(
  params: BenefitProductListParams,
): Promise<ApiResponse<PageResult<BenefitProduct>>> {
  const response = await request.get<ApiResponse<PageResult<BenefitProduct>>>('/api/admin/benefits/products', { params });
  return response.data;
}

export async function saveBenefitProduct(params: BenefitProductSaveParams, id?: string): Promise<ApiResponse<BenefitProduct>> {
  const response = id
    ? await request.put<ApiResponse<BenefitProduct>>(`/api/admin/benefits/products/${id}`, params)
    : await request.post<ApiResponse<BenefitProduct>>('/api/admin/benefits/products', params);
  return response.data;
}

export async function updateBenefitProductStatus(id: string, status: string): Promise<ApiResponse<BenefitProduct>> {
  const response = await request.post<ApiResponse<BenefitProduct>>(`/api/admin/benefits/products/${id}/status`, { status });
  return response.data;
}

export async function fetchBenefitOrders(params: { pageNo?: number; pageSize?: number }): Promise<ApiResponse<PageResult<BenefitExchangeOrder>>> {
  const response = await request.get<ApiResponse<PageResult<BenefitExchangeOrder>>>('/api/admin/benefits/orders', { params });
  return response.data;
}
