import { z } from 'zod';
import { InteractionType } from '@prisma/client';

export const createInteractionSchema = z.object({
    type: z.nativeEnum(InteractionType),
    content: z.string().min(1),
    customerId: z.string().uuid(),
    leadId: z.string().uuid().optional(),
    dealId: z.string().uuid().optional(),
});

export type CreateInteractionInput = z.infer<typeof createInteractionSchema>;
