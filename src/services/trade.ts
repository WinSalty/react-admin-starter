import { request } from '@/services/request';
import type { ApiResponse } from '@/types/api';
import type { OnlineRechargeOrder } from '@/types/trade';

export async function createOnlineRecharge(amount: number, idempotencyKey: string): Promise<ApiResponse<OnlineRechargeOrder>> {
  const response = await request.post<ApiResponse<OnlineRechargeOrder>>('/api/trade/recharge/orders', {
    amount,
    idempotencyKey,
  });
  return response.data;
}

export async function fetchOnlineRechargeOrder(rechargeNo: string): Promise<ApiResponse<OnlineRechargeOrder>> {
  const response = await request.get<ApiResponse<OnlineRechargeOrder>>(`/api/trade/recharge/orders/${rechargeNo}`);
  return response.data;
}
