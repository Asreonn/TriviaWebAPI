import { Router } from 'express';
import {
    createQuizSubmission,
    getPendingQuizzesHandler,
    getQuizCategoriesHandler,
    getQuizStatsHandler,
    getRandomQuizHandler,
} from '../controllers/quizController.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { requireAnyPermission } from '../middleware/rbac.js';

const router = Router();

router.get('/random', optionalAuth, getRandomQuizHandler);
router.get('/stats', getQuizStatsHandler);
router.get('/categories', getQuizCategoriesHandler);
router.post('/', createQuizSubmission);
router.get(
    '/pending',
    requireAuth,
    requireAnyPermission('view_pending_quizzes', 'approve_quizzes', 'reject_quizzes'),
    getPendingQuizzesHandler
);

export default router;
