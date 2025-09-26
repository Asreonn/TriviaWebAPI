import { Router } from 'express';
import { healthCheck } from '../controllers/healthController.js';

const router = Router();

router.get('/', healthCheck);
router.get('/ready', healthCheck);

export default router;
