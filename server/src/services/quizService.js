import { config } from '../config/index.js';
import { quizFiltersSchema, quizReviewSchema, quizSubmissionSchema } from '../validations/quizValidation.js';
import { QuizRepository } from '../repositories/quizRepository.js';
import { SubmissionRepository } from '../repositories/submissionRepository.js';
import { ApiError } from '../utils/ApiError.js';
import { recordAuditEvent } from './auditService.js';
import { getCacheClient } from '../utils/cache.js';
import { scheduleQuizServed } from '../jobs/index.js';

const normalizeCategory = (category) => category.trim().toLowerCase();

const CACHE_KEYS = {
    AVAILABLE_FILTERS: 'quizzes:available-filters',
};

const invalidateFilterCache = async () => {
    const cache = getCacheClient();
    if (cache) {
        await cache.del(CACHE_KEYS.AVAILABLE_FILTERS);
    }
};

export const submitQuiz = async (payload, context = {}) => {
    const input = quizSubmissionSchema.parse(payload);

    const normalizedQuiz = {
        ...input,
        category: normalizeCategory(input.category),
        status: 'pending',
        submission: {
            submittedBy: context.submitter ?? input.author,
            submittedAt: new Date(),
        },
    };

    const quiz = await QuizRepository.create(normalizedQuiz);

    await SubmissionRepository.create({
        quizId: quiz.id,
        submittedBy: context.submitter ?? input.author,
        metadata: {
            ipAddress: context.ip,
            userAgent: context.userAgent,
        },
    });

    await invalidateFilterCache();

    return quiz;
};

export const getRandomQuiz = async (filters = {}) => {
    const input = quizFiltersSchema.parse(filters);

    const quiz = await QuizRepository.findRandomApproved(input);
    const availableFilters = await getAvailableQuizFilters();

    if (!quiz) {
        return { quiz: null, filters: availableFilters };
    }

    await scheduleQuizServed(quiz.id);

    return {
        quiz: quiz.toJSON(),
        filters: availableFilters,
    };
};

export const getQuizStats = async () => {
    const [quizStats, submissionStats] = await Promise.all([
        QuizRepository.getStats(),
        SubmissionRepository.getStats(),
    ]);

    return {
        ...quizStats,
        submissions: submissionStats,
    };
};

export const listPendingQuizzes = async ({ page, limit }) => {
    const quizzes = await QuizRepository.findPending(page, limit);
    const total = await QuizRepository.countPending();

    return {
        quizzes,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1,
        },
    };
};

export const reviewQuiz = async ({ quizId, decision, reason, admin, ip, userAgent }) => {
    const input = quizReviewSchema.parse({ decision, reason });

    const quiz = await QuizRepository.findById(quizId);

    if (!quiz) {
        throw new ApiError(404, 'Quiz not found');
    }

    if (quiz.status !== 'pending') {
        throw new ApiError(409, 'Quiz has already been reviewed');
    }

    if (input.decision === 'reject' && !input.reason) {
        throw new ApiError(400, 'Rejections must include a reason');
    }

    const updatedQuiz = await QuizRepository.updateStatus(quizId, input.decision === 'approve' ? 'approved' : 'rejected', {
        reviewedBy: admin.id,
        reason: input.reason,
    });

    const submission = await SubmissionRepository.findByQuizId(quiz.id);
    if (submission) {
        await SubmissionRepository.updateStatus(submission.id, updatedQuiz.status, {
            reviewedBy: admin.id,
            reason: input.reason,
        });
    }

    await recordAuditEvent({
        actor: admin.id,
        action: `quiz.${input.decision}`,
        resourceType: 'quiz',
        resourceId: quizId,
        description: `Quiz ${input.decision}d by ${admin.username}`,
        metadata: {
            ipAddress: ip,
            userAgent,
        },
    });

    await invalidateFilterCache();

    return updatedQuiz;
};

export const getAvailableQuizFilters = async () => {
    const cache = getCacheClient();

    if (cache) {
        const cached = await cache.get(CACHE_KEYS.AVAILABLE_FILTERS);
        if (cached) {
            return JSON.parse(cached);
        }
    }

    const filters = await QuizRepository.getAvailableFilters();

    if (cache) {
        await cache.set(
            CACHE_KEYS.AVAILABLE_FILTERS,
            JSON.stringify(filters),
            'EX',
            config.redis.cacheTtlSeconds
        );
    }

    return filters;
};
