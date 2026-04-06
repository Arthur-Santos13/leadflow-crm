import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
import { env } from '../../config/env';

const SALT_ROUNDS = 12;
const RESET_TOKEN_TTL_MS = 1000 * 60 * 60; // 1 hora

export async function register(name: string, email: string, password: string) {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
        const err = new Error('Email already in use');
        (err as NodeJS.ErrnoException).code = 'EMAIL_TAKEN';
        throw err;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
        data: { name, email, passwordHash },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    const token = signToken(user.id, user.role);
    return { user, token };
}

export async function login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new Error('Invalid credentials');

    const token = signToken(user.id, user.role);
    const { passwordHash: _ph, resetToken: _rt, resetTokenExpires: _rte, ...safeUser } = user;
    return { user: safeUser, token };
}

export async function forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    // Responde igual independente de o e-mail existir (evita enumeração)
    if (!user) return { message: 'If this email is registered, a reset link will be sent.' };

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    await prisma.user.update({
        where: { id: user.id },
        data: {
            resetToken: hashedToken,
            resetTokenExpires: new Date(Date.now() + RESET_TOKEN_TTL_MS),
        },
    });

    // Em produção: enviar e-mail com link contendo rawToken
    // Por ora retornamos o token para fins de desenvolvimento/teste
    return {
        message: 'If this email is registered, a reset link will be sent.',
        ...(env.NODE_ENV !== 'production' && { resetToken: rawToken }),
    };
}

export async function resetPassword(rawToken: string, newPassword: string) {
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    const user = await prisma.user.findFirst({
        where: {
            resetToken: hashedToken,
            resetTokenExpires: { gt: new Date() },
        },
    });

    if (!user) throw new Error('Token invalid or expired');

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash, resetToken: null, resetTokenExpires: null },
    });

    return { message: 'Password updated successfully' };
}

function signToken(userId: string, role: string) {
    return jwt.sign({ sub: userId, role }, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
}
