import { prisma } from '../../lib/prisma';
import { UserRole } from '@prisma/client';

const USER_SELECT = {
    id: true,
    name: true,
    email: true,
    role: true,
    createdAt: true,
    updatedAt: true,
} as const;

export async function listUsers() {
    return prisma.user.findMany({
        select: USER_SELECT,
        orderBy: { createdAt: 'asc' },
    });
}

export async function updateUserRole(id: string, role: UserRole, requestingUserId: string) {
    if (id === requestingUserId) {
        const err = new Error('Cannot change your own role');
        (err as NodeJS.ErrnoException).code = 'SELF_ROLE_CHANGE';
        throw err;
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
        const err = new Error('User not found');
        (err as NodeJS.ErrnoException).code = 'NOT_FOUND';
        throw err;
    }

    return prisma.user.update({
        where: { id },
        data: { role },
        select: USER_SELECT,
    });
}
