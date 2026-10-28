import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { connectDB, getDbStatus } from './config/db.js';
import { seedMongoIfEmpty } from './utils/dataStore.js';
import { sanitizeData } from './middleware/sanitize.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import analysisRoutes from './routes/analysisRoutes.js';
import atsRoutes from './routes/atsRoutes.js';
import jobMatchRoutes from './routes/jobMatchRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env relative to backend directory, with fallback
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true
}));

// Cookie Parser Middleware
app.use((req, res, next) => {
  req.cookies = {};
  const cookieHeader = req.headers?.cookie;
  if (cookieHeader) {
    cookieHeader.split(';').forEach(part => {
      const [key, ...val] = part.trim().split('=');
      if (key) {
        req.cookies[key] = decodeURIComponent(val.join('='));
      }
    });
  }
  next();
});

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(sanitizeData);

// Static uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// System Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'AI Resume Reviewer Backend',
    timestamp: new Date().toISOString(),
    uptime: `${Math.round(process.uptime())}s`,
    database: getDbStatus()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'AI Resume Reviewer Backend',
    timestamp: new Date().toISOString(),
    uptime: `${Math.round(process.uptime())}s`,
    database: getDbStatus()
  });
});

// Mount Microservice API Routers
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/ats', atsRoutes);
app.use('/api/job-match', jobMatchRoutes);

// Fallback 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Backend Error]:', err.stack || err.message);
  let status = err.status || 500;
  let message = err.message || 'Internal Server Error';

  if (err.code === 'LIMIT_FILE_SIZE') {
    status = 413;
    message = 'File size exceeds 10MB limit. Please upload a smaller document.';
  } else if (err.message && err.message.toLowerCase().includes('invalid file type')) {
    status = 400;
    message = err.message;
  }

  res.status(status).json({
    success: false,
    message
  });
});

// Start Server and Connect Database
const startServer = async () => {
  await connectDB();
  await seedMongoIfEmpty();

  const server = app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 AI Resume Reviewer Backend running on: http://localhost:${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/health`);
    console.log(`📑 Available Services:`);
    console.log(`   - Auth Service:       http://localhost:${PORT}/api/auth`);
    console.log(`   - Resumes Service:    http://localhost:${PORT}/api/resumes`);
    console.log(`   - Analysis Service:   http://localhost:${PORT}/api/analysis`);
    console.log(`   - ATS Service:        http://localhost:${PORT}/api/ats`);
    console.log(`   - Job Match Service:  http://localhost:${PORT}/api/job-match`);
    console.log(`   - User Service:       http://localhost:${PORT}/api/users`);
    console.log(`======================================================\n`);
  });

  // Optional: Listen on separate microservice ports 5001-5006 for 100% compatibility with .env.example
  const microservicePorts = [
    { port: 5001, name: 'Auth Service' },
    { port: 5002, name: 'Resume Service' },
    { port: 5003, name: 'Analysis Service' },
    { port: 5004, name: 'ATS Service' },
    { port: 5005, name: 'Job Match Service' },
    { port: 5006, name: 'User Service' }
  ];

  for (const ms of microservicePorts) {
    try {
      app.listen(ms.port, () => {
        console.log(`[Microservice Port] ${ms.name} listening on port ${ms.port}`);
      }).on('error', () => {
        // Port might be in use or restricted, primary port 5000 is always active
      });
    } catch {}
  }
};

startServer();
