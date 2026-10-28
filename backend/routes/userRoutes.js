import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/userController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', optionalAuth, getUserProfile);
router.put('/profile', optionalAuth, updateUserProfile);

export default router;
