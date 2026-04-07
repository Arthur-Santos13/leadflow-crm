export interface PaginationMeta {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data?: T[];
    meta: PaginationMeta;
}

export interface Customer {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    company?: string | null;
    notes?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Lead {
    id: string;
    title: string;
    status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'UNQUALIFIED' | 'CONVERTED';
    source?: string | null;
    notes?: string | null;
    customerId: string;
    customer?: { id: string; name: string; email: string };
    createdAt: string;
    updatedAt: string;
}

export interface Deal {
    id: string;
    title: string;
    stage: 'PROSPECTING' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST';
    value?: number | string | null;
    expectedAt?: string | null;
    closedAt?: string | null;
    customerId: string;
    leadId?: string | null;
    customer?: { id: string; name: string; email: string };
    lead?: { id: string; title: string; status: string } | null;
    createdAt: string;
    updatedAt: string;
}
