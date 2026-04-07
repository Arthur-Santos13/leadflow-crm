import { api } from '../lib/axios';
import type { PaginatedResponse, ApiResponse, Deal } from '../types';

export interface ListDealsParams {
    page?: number;
    perPage?: number;
    search?: string;
    stage?: Deal['stage'];
    customerId?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
}

export interface DealPayload {
    title: string;
    customerId: string;
    leadId?: string;
    stage?: Deal['stage'];
    value?: number;
    expectedAt?: string;
}

export async function listDeals(params: ListDealsParams = {}) {
    const res = await api.get<PaginatedResponse<Deal>>('/deals', { params });
    return res.data;
}

export async function createDeal(payload: DealPayload) {
    const res = await api.post<ApiResponse<Deal>>('/deals', payload);
    return res.data;
}

export async function updateDealStage(id: string, stage: Deal['stage']) {
    const res = await api.patch<ApiResponse<Deal>>(`/deals/${id}/stage`, { stage });
    return res.data;
}

export async function deleteDeal(id: string) {
    await api.delete(`/deals/${id}`);
}
