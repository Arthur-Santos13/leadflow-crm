import { vi, describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '../lib/prisma';
import * as usersService from '../modules/users/users.service';

describe('users.service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // -------------------------------------------------------------------------
    describe('listUsers', () => {
        it('returns all users from the database', async () => {
            const mockUsers = [
                { id: 'u1', name: 'Alice', email: 'alice@b.com', role: 'ADMIN', createdAt: new Date(), updatedAt: new Date() },
                { id: 'u2', name: 'Bob', email: 'bob@b.com', role: 'AGENT', createdAt: new Date(), updatedAt: new Date() },
            ];
            vi.mocked(prisma.user.findMany).mockResolvedValueOnce(mockUsers as any);

            const result = await usersService.listUsers();

            expect(result).toEqual(mockUsers);
            expect(prisma.user.findMany).toHaveBeenCalledOnce();
        });

        it('returns an empty array when there are no users', async () => {
            vi.mocked(prisma.user.findMany).mockResolvedValueOnce([]);

            const result = await usersService.listUsers();

            expect(result).toEqual([]);
        });
    });

    // -------------------------------------------------------------------------
    describe('updateUserRole', () => {
        it('throws SELF_ROLE_CHANGE when the user tries to change their own role', async () => {
            await expect(
                usersService.updateUserRole('u1', 'AGENT' as any, 'u1')
            ).rejects.toMatchObject({ message: 'Cannot change your own role', code: 'SELF_ROLE_CHANGE' });

            expect(prisma.user.findUnique).not.toHaveBeenCalled();
        });

        it('throws NOT_FOUND when target user does not exist', async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);

            await expect(
                usersService.updateUserRole('u99', 'AGENT' as any, 'u1')
            ).rejects.toMatchObject({ message: 'User not found', code: 'NOT_FOUND' });

            expect(prisma.user.update).not.toHaveBeenCalled();
        });

        it('updates and returns the user when the request is valid', async () => {
            const existingUser = { id: 'u2', name: 'Bob', email: 'bob@b.com', role: 'AGENT' };
            const updatedUser = { ...existingUser, role: 'ADMIN' };
            vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(existingUser as any);
            vi.mocked(prisma.user.update).mockResolvedValueOnce(updatedUser as any);

            const result = await usersService.updateUserRole('u2', 'ADMIN' as any, 'u1');

            expect(result).toEqual(updatedUser);
            expect(prisma.user.update).toHaveBeenCalledWith(
                expect.objectContaining({ where: { id: 'u2' }, data: { role: 'ADMIN' } })
            );
        });
    });
});
