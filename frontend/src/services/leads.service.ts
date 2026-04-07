import { api } from '../lib/axios';
import type { PaginatedResponse, ApiResponse, Lead } from '../types';

export interface ListLeadsParams {
    page?: number;
    perPage?: number;
    search?: string;
    status?: Lead['status'];
    customerId?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
}

export interface LeadPayload {
    title: string;
    customerId: string;
    status?: Lead['status'];
    source?: string;
    notes?: string;
}

export async function listLeads(params: ListLeadsParams = {}) {
    const res = await api.get<PaginatedResponse<Lead>>('/leads', { params });
    return res.data;
}

export async function createLead(payload: LeadPayload) {
    const res = await api.post<ApiResponse<Lead>>('/leads', payload);
    return res.data;
}

export async function updateLead(id: string, payload: Partial<Omit<LeadPayload, 'customerId'>>) {
    const res = await api.patch<ApiResponse<Lead>>(`/leads/${id}`, payload);
    return res.data;
}

export async function updateLeadStatus(id: string, status: Lead['status']) {
    const res = await api.patch<ApiResponse<Lead>>(`/leads/${id}/status`, { status });
    return res.data;
}

export async function deleteLead(id: string) {
    await api.delete(`/leads/${id}`);
}
