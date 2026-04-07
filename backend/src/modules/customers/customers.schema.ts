import { z } from 'zod';

export const createCustomerSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    phone: z.string().max(20).optional(),
    company: z.string().max(100).optional(),
    notes: z.string().max(1000).optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
