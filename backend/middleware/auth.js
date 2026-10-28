import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'resumate_ai_jwt_secret_key_2026_production_grade';

/**
 * Protect routes - Verifies Bearer JWT token
 */
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route, token missing' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Attempt database lookup if connected
    let user = null;
    try {
      user = await User.findOne({ $or: [{ id: decoded.id }, { _id: decoded.id }] });
    } catch {
      // ignore db error
    }

    if (!user) {
      req.user = {
        id: decoded.id || 'usr_88291',
        name: decoded.name || 'Alex Morgan',
        email: decoded.email || 'alex.morgan@techcareer.io'
      };
    } else {
      req.user = user;
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token', error: error.message });
  }
};

/**
 * Optional authentication middleware: attaches user if token is present, does not reject if absent
 */
export const optionalAuth = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch {
      // continue without req.user
    }
  }
  next();
};
