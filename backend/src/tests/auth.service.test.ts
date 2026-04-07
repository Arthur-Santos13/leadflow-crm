import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock env before any service import to prevent process.exit on missing env vars
vi.mock('../config/env', () => ({
    env: {
        JWT_SECRET: 'test-super-secret-key-minimum-16',
        JWT_EXPIRES_IN: '7d',
        NODE_ENV: 'test',
    },
}));

// Mock bcrypt to avoid slow hash rounds in unit tests
vi.mock('bcryptjs', () => ({
    default: {
        hash: vi.fn((password: string) => Promise.resolve(`hashed:${password}`)),
        compare: vi.fn((password: string, hash: string) =>
            Promise.resolve(hash === `hashed:${password}`)
        ),
    },
}));

import { prisma } from '../lib/prisma';
import * as authService from '../modules/auth/auth.service';

describe('auth.service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // -------------------------------------------------------------------------
    describe('register', () => {
        it('throws EMAIL_TAKEN when email is already in use', async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
                id: 'u1',
                email: 'a@b.com',
            } as any);

            await expect(
                authService.register('John', 'a@b.com', 'password123')
            ).rejects.toMatchObject({ message: 'Email already in use', code: 'EMAIL_TAKEN' });
        });

        it('creates user and returns a signed token on success', async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
            const mockUser = {
                id: 'u1',
                name: 'John',
                email: 'a@b.com',
                role: 'USER',
                createdAt: new Date(),
            };
            vi.mocked(prisma.user.create).mockResolvedValueOnce(mockUser as any);

            const result = await authService.register('John', 'a@b.com', 'password123');

            expect(result.user).toEqual(mockUser);
            expect(typeof result.token).toBe('string');
            expect(result.token.split('.')).toHaveLength(3); // JWT structure
        });

        it('stores the hashed password, not plain text', async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
            vi.mocked(prisma.user.create).mockResolvedValueOnce({
                id: 'u1',
                name: 'John',
                email: 'a@b.com',
                role: 'USER',
                createdAt: new Date(),
            } as any);

            await authService.register('John', 'a@b.com', 'password123');

            const createArg = vi.mocked(prisma.user.create).mock.calls[0][0];
            expect(createArg.data.passwordHash).toBe('hashed:password123');
            expect(createArg.data.passwordHash).not.toBe('password123');
        });
    });

    // -------------------------------------------------------------------------
    describe('login', () => {
        it('throws Invalid credentials when user is not found', async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);

            await expect(
                authService.login('a@b.com', 'password123')
            ).rejects.toThrow('Invalid credentials');
        });

        it('throws Invalid credentials when password does not match', async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
                id: 'u1',
                email: 'a@b.com',
                passwordHash: 'hashed:correct-password',
                resetToken: null,
                resetTokenExpires: null,
            } as any);

            await expect(
                authService.login('a@b.com', 'wrong-password')
            ).rejects.toThrow('Invalid credentials');
        });

        it('returns safe user (no sensitive fields) and token on valid credentials', async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
                id: 'u1',
                name: 'John',
                email: 'a@b.com',
                role: 'USER',
                createdAt: new Date(),
                passwordHash: 'hashed:password123',
                resetToken: null,
                resetTokenExpires: null,
            } as any);

            const result = await authService.login('a@b.com', 'password123');

            expect(typeof result.token).toBe('string');
            expect(result.user).not.toHaveProperty('passwordHash');
            expect(result.user).not.toHaveProperty('resetToken');
            expect(result.user).not.toHaveProperty('resetTokenExpires');
            expect(result.user.email).toBe('a@b.com');
        });
    });

    // -------------------------------------------------------------------------
    describe('forgotPassword', () => {
        it('returns generic message without calling update when user does not exist', async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);

            const result = await authService.forgotPassword('ghost@b.com');

            expect(result.message).toContain('If this email is registered');
            expect(prisma.user.update).not.toHaveBeenCalled();
        });

        it('stores a hashed reset token and exposes raw token in non-production', async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
                id: 'u1',
                email: 'a@b.com',
            } as any);
            vi.mocked(prisma.user.update).mockResolvedValueOnce({} as any);

            const result = await authService.forgotPassword('a@b.com');

            expect(result.message).toContain('If this email is registered');
            // Raw token is exposed in non-production environments
            expect(result).toHaveProperty('resetToken');

            // The stored token must differ from the raw one (it's SHA-256 hashed)
            const updateArg = vi.mocked(prisma.user.update).mock.calls[0][0];
            expect(updateArg.data.resetToken).not.toEqual(result.resetToken);
        });
    });

    // -------------------------------------------------------------------------
    describe('resetPassword', () => {
        it('throws Token invalid or expired when no user matches the token', async () => {
            vi.mocked(prisma.user.findFirst).mockResolvedValueOnce(null);

            await expect(
                authService.resetPassword('bad-token', 'newpassword123')
            ).rejects.toThrow('Token invalid or expired');
        });

        it('updates password hash and clears reset token fields on success', async () => {
            vi.mocked(prisma.user.findFirst).mockResolvedValueOnce({
                id: 'u1',
                email: 'a@b.com',
            } as any);
            vi.mocked(prisma.user.update).mockResolvedValueOnce({} as any);

            await authService.resetPassword('valid-token', 'newpassword123');

            const updateArg = vi.mocked(prisma.user.update).mock.calls[0][0];
            expect(updateArg.data.passwordHash).toBe('hashed:newpassword123');
            expect(updateArg.data.resetToken).toBeNull();
            expect(updateArg.data.resetTokenExpires).toBeNull();
        });
    });
});
