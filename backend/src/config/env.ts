import { z } from 'zod';

const postgresUrl = z
    .string()
    .url()
    .startsWith('postgresql://', 'Must start with postgresql://');

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(3333),
    DATABASE_URL: postgresUrl,
    DATABASE_URL_UNPOOLED: postgresUrl,
    JWT_SECRET: z.string().min(16, 'JWT_SECRET deve ter ao menos 16 caracteres'),
    JWT_EXPIRES_IN: z.string().default('3d'),
    CORS_ORIGIN: z
        .string()
        .optional()
        .transform((s) => s?.trim() || undefined),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('❌ Variáveis de ambiente inválidas:');
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
}

export const env = parsed.data;
