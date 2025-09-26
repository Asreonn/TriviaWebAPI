import { z } from 'zod';

export const adminLoginSchema = z.object({
    username: z.string().trim().min(3),
    password: z.string().min(6),
});

export const adminReviewSchema = z.object({
    quizId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid quiz id'),
    decision: z.enum(['approve', 'reject']),
    reason: z
        .string()
        .trim()
        .min(10)
        .optional(),
});
