import { Router } from 'express';
import { getResults, createResult } from '../controllers/resultController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Route to get all results
router.get('/', authenticate, getResults);

// Route to create a new result
router.post('/', authenticate, createResult);

export default router;