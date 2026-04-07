import { z } from 'zod';
import { LeadStatus } from '@prisma/client';

export const createLeadSchema = z.object({
    title: z.string().min(2).max(150),
    customerId: z.string().uuid(),
    status: z.nativeEnum(LeadStatus).default(LeadStatus.NEW),
    source: z.string().max(100).optional(),
    notes: z.string().max(1000).optional(),
});

export const updateLeadSchema = createLeadSchema
    .omit({ customerId: true })
    .partial();

export const updateLeadStatusSchema = z.object({
    status: z.nativeEnum(LeadStatus),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
