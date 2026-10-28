import express from 'express';
import { getResumeAnalysis, reanalyzeResume, compareResumes } from '../controllers/analysisController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/compare', optionalAuth, compareResumes);
router.get('/:resumeId', optionalAuth, getResumeAnalysis);
router.post('/:resumeId/reanalyze', optionalAuth, reanalyzeResume);

export default router;
