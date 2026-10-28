import express from 'express';
import { getAtsAnalysis, getAtsKeywords } from '../controllers/atsController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/:resumeId/keywords', optionalAuth, getAtsKeywords);
router.get('/:resumeId', optionalAuth, getAtsAnalysis);

export default router;
