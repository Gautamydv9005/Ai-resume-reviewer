import express from 'express';
import { uploadResume, getResumeHistory, getResume, renameResume, deleteResume } from '../controllers/resumeController.js';
import { upload } from '../middleware/upload.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/upload', optionalAuth, upload.single('resume'), uploadResume);
router.get('/history', optionalAuth, getResumeHistory);
router.get('/:id', optionalAuth, getResume);
router.patch('/:id/rename', optionalAuth, renameResume);
router.delete('/:id', optionalAuth, deleteResume);

export default router;
