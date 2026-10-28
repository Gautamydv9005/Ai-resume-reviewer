import express from 'express';
import { getJobMatchAnalysis, calculateMatchScore } from '../controllers/jobMatchController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/:resumeId/match', optionalAuth, calculateMatchScore);
router.get('/:resumeId', optionalAuth, getJobMatchAnalysis);
router.post('/:resumeId', optionalAuth, getJobMatchAnalysis);

export default router;
