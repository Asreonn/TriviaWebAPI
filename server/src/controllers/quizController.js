import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
    getAvailableQuizFilters,
    getQuizStats,
    getRandomQuiz,
    listPendingQuizzes,
    submitQuiz,
} from '../services/quizService.js';
import { paginationSchema } from '../validations/quizValidation.js';

export const createQuizSubmission = asyncHandler(async (req, res) => {
    const quiz = await submitQuiz(req.body, {
        submitter: req.body.author,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
    });

    const response = new ApiResponse({
        message: 'Quiz submitted for review',
        data: { quiz },
        traceId: req.traceId,
    });

    res.status(201).json(response);
});

export const getRandomQuizHandler = asyncHandler(async (req, res) => {
    const { quiz, filters } = await getRandomQuiz(req.query);
    const response = new ApiResponse({
        data: { quiz, filters },
        traceId: req.traceId,
    });
    res.status(200).json(response);
});

export const getQuizStatsHandler = asyncHandler(async (req, res) => {
    const stats = await getQuizStats();
    res.status(200).json(
        new ApiResponse({
            data: { stats },
            traceId: req.traceId,
        })
    );
});

export const getQuizCategoriesHandler = asyncHandler(async (req, res) => {
    const filters = await getAvailableQuizFilters();
    res.status(200).json(
        new ApiResponse({
            data: { categories: filters.categories },
            traceId: req.traceId,
        })
    );
});

export const getPendingQuizzesHandler = asyncHandler(async (req, res) => {
    const pagination = paginationSchema.parse({
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10,
    });

    const result = await listPendingQuizzes(pagination);

    res.status(200).json(
        new ApiResponse({
            data: result,
            traceId: req.traceId,
        })
    );
});
