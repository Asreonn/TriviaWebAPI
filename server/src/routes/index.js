import { Router } from 'express';
import adminRouter from './adminRoutes.js';
import healthRouter from './healthRoutes.js';
import quizRouter from './quizRoutes.js';

const router = Router();

router.use('/health', healthRouter);
router.use('/quizzes', quizRouter);
router.use('/admin', adminRouter);

export default router;
