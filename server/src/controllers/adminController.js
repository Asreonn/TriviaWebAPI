import { authenticateAdmin } from '../services/adminService.js';
import { getQuizStats, reviewQuiz } from '../services/quizService.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { adminLoginSchema } from '../validations/adminValidation.js';

export const adminLoginHandler = asyncHandler(async (req, res) => {
    const credentials = adminLoginSchema.parse(req.body);

    const { admin, tokens } = await authenticateAdmin({
        username: credentials.username,
        password: credentials.password,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
    });

    const response = new ApiResponse({
        message: 'Login successful',
        data: {
            admin,
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        },
        traceId: req.traceId,
    });

    response.admin = admin;
    response.token = tokens.accessToken;
    response.refreshToken = tokens.refreshToken;

    res.status(200).json(response);
});

export const adminStatsHandler = asyncHandler(async (req, res) => {
    const stats = await getQuizStats();

    res.status(200).json(
        new ApiResponse({
            data: { stats },
            traceId: req.traceId,
        })
    );
});

export const adminReviewQuizHandler = asyncHandler(async (req, res) => {
    const { quizId, action } = req.params;

    if (!quizId) {
        throw new ApiError(400, 'Quiz id is required');
    }

    if (!['approve', 'reject'].includes(action)) {
        throw new ApiError(400, 'Invalid review action');
    }

    const updatedQuiz = await reviewQuiz({
        quizId,
        decision: action,
        reason: req.body.reason,
        admin: req.user,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
    });

    res.status(200).json(
        new ApiResponse({
            message: `Quiz ${action}d successfully`,
            data: { quiz: updatedQuiz },
            traceId: req.traceId,
        })
    );
});
