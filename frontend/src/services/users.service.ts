import { api } from '../lib/axios';
import type { AppUser, UserRole, ApiResponse } from '../types';

export const usersService = {
    list(): Promise<AppUser[]> {
        return api.get<ApiResponse<AppUser[]>>('/users').then(r => r.data.data ?? []);
    },

    updateRole(id: string, role: UserRole): Promise<AppUser> {
        return api.patch<ApiResponse<AppUser>>(`/users/${id}/role`, { role }).then(r => r.data.data!);
    },
};
