import { z } from 'zod';
import { DealStage } from '@prisma/client';

export const createDealSchema = z.object({
    title: z.string().min(1).max(200),
    customerId: z.string().uuid(),
    leadId: z.string().uuid().optional(),
    stage: z.nativeEnum(DealStage).default(DealStage.PROSPECTING),
    value: z.number().positive().optional(),
    expectedAt: z.coerce.date().optional(),
});

export const updateDealSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    leadId: z.string().uuid().nullable().optional(),
    value: z.number().positive().nullable().optional(),
    expectedAt: z.coerce.date().nullable().optional(),
});

export const updateDealStageSchema = z.object({
    stage: z.nativeEnum(DealStage),
});

export type CreateDealInput = z.infer<typeof createDealSchema>;
export type UpdateDealInput = z.infer<typeof updateDealSchema>;
export type UpdateDealStageInput = z.infer<typeof updateDealStageSchema>;
