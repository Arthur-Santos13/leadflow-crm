import { api } from '../lib/axios';
import type { PaginatedResponse, ApiResponse, Customer } from '../types';

export interface ListCustomersParams {
    page?: number;
    perPage?: number;
    search?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
}

export interface CustomerPayload {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    notes?: string;
}

export async function listCustomers(params: ListCustomersParams = {}) {
    const res = await api.get<PaginatedResponse<Customer>>('/customers', { params });
    return res.data;
}

export async function createCustomer(payload: CustomerPayload) {
    const res = await api.post<ApiResponse<Customer>>('/customers', payload);
    return res.data;
}

export async function updateCustomer(id: string, payload: Partial<CustomerPayload>) {
    const res = await api.patch<ApiResponse<Customer>>(`/customers/${id}`, payload);
    return res.data;
}

export async function deleteCustomer(id: string) {
    await api.delete(`/customers/${id}`);
}
