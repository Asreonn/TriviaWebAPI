import { Router } from 'express';
import {
    adminLoginHandler,
    adminReviewQuizHandler,
    adminStatsHandler,
} from '../controllers/adminController.js';
import { getPendingQuizzesHandler } from '../controllers/quizController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAnyPermission, requirePermission } from '../middleware/rbac.js';

const router = Router();

router.post('/login', adminLoginHandler);

router.get(
    '/stats',
    requireAuth,
    requireAnyPermission('view_stats', 'approve_quizzes', 'reject_quizzes'),
    adminStatsHandler
);

router.get(
    '/quizzes/pending',
    requireAuth,
    requireAnyPermission('view_pending_quizzes', 'approve_quizzes', 'reject_quizzes'),
    getPendingQuizzesHandler
);

const reviewPermissionGuard = (req, res, next) => {
    const { action } = req.params;
    const permission = action === 'approve' ? 'approve_quizzes' : 'reject_quizzes';
    return requirePermission(permission)(req, res, next);
};

router.post(
    '/quizzes/:quizId/:action',
    requireAuth,
    reviewPermissionGuard,
    adminReviewQuizHandler
);

export default router;
