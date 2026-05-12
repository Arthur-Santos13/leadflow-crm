import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        env: {
            DATABASE_URL: 'postgresql://test:test@127.0.0.1:5432/test',
            DATABASE_URL_UNPOOLED: 'postgresql://test:test@127.0.0.1:5432/test',
            JWT_SECRET: 'test-super-secret-key-minimum-16',
            NODE_ENV: 'test',
        },
        coverage: {
            provider: 'v8',
            reporter: ['text', 'lcov'],
            include: ['src/**/*.ts'],
            exclude: ['src/server.ts', 'src/**/*.schema.ts', 'src/lib/**', 'src/config/**'],
        },
        setupFiles: ['./src/tests/setup.ts'],
    },
});
