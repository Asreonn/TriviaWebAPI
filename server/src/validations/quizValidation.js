import { z } from 'zod';

export const quizFiltersSchema = z
    .object({
        category: z.string().trim().min(1).toLowerCase().optional(),
        difficulty: z.enum(['kolay', 'orta', 'zor']).optional(),
        type: z.enum(['multiple', 'boolean']).optional(),
        author: z.string().trim().min(1).optional(),
    })
    .partial();

const answersSchema = z.array(z.string().trim().min(1)).max(6);

export const quizSubmissionSchema = z
    .object({
        question: z.string().trim().min(10),
        type: z.enum(['multiple', 'boolean']).default('multiple'),
        category: z.string().trim().min(3),
        answers: answersSchema.default([]),
        correctAnswer: z.number().int().min(0),
        author: z.string().trim().min(2),
        difficulty: z.enum(['kolay', 'orta', 'zor']).default('kolay'),
    })
    .superRefine((value, ctx) => {
        if (value.type === 'multiple') {
            if (value.answers.length < 2) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['answers'],
                    message: 'Multiple choice questions require at least 2 answers',
                });
            }
            if (value.correctAnswer < 0 || value.correctAnswer >= value.answers.length) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['correctAnswer'],
                    message: 'Correct answer index must reference one of the provided answers',
                });
            }
        } else {
            if (value.answers.length > 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['answers'],
                    message: 'Boolean questions should not include answers array',
                });
            }
            if (![0, 1].includes(value.correctAnswer)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['correctAnswer'],
                    message: 'Boolean questions require correctAnswer to be 0 (false) or 1 (true)',
                });
            }
        }
    });

export const quizReviewSchema = z.object({
    decision: z.enum(['approve', 'reject']),
    reason: z
        .string()
        .trim()
        .min(10, 'Please provide a reason with at least 10 characters')
        .optional(),
});

export const paginationSchema = z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(10),
});
