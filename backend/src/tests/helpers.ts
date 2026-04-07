import jwt from 'jsonwebtoken';

const TEST_JWT_SECRET = 'test-super-secret-key-minimum-16';

export function makeToken(payload: { id?: string; role?: string } = {}): string {
    return jwt.sign(
        { sub: payload.id ?? 'test-user-id', role: payload.role ?? 'USER' },
        TEST_JWT_SECRET,
        { expiresIn: '1h' }
    );
}

export const adminToken = makeToken({ id: 'admin-user-id', role: 'ADMIN' });
export const userToken = makeToken({ id: 'regular-user-id', role: 'USER' });
