import express from 'express';
import { uploadResume, getResumeHistory, getResume, renameResume, deleteResume } from '../controllers/resumeController.js';
import { uploadResumeMiddleware } from '../middleware/upload.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Resume Upload & Analysis — Supports POST /api/resumes and POST /api/resumes/upload
router.post('/upload', optionalAuth, uploadResumeMiddleware, uploadResume);
router.post('/', optionalAuth, uploadResumeMiddleware, uploadResume);

// Resume History / Listing — Supports GET /api/resumes and GET /api/resumes/history
router.get('/history', optionalAuth, getResumeHistory);
router.get('/', optionalAuth, getResumeHistory);

// Specific Resume Operations
router.get('/:id', optionalAuth, getResume);
router.patch('/:id/rename', optionalAuth, renameResume);
router.put('/:id/rename', optionalAuth, renameResume);
router.delete('/:id', optionalAuth, deleteResume);

export default router;
