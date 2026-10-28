import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to make HTTP requests
function request(port, options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      port,
      hostname: 'localhost',
      ...options
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: parsed
        });
      });
    });

    req.on('error', reject);

    if (body) {
      if (typeof body === 'string' || Buffer.isBuffer(body)) {
        req.write(body);
      } else {
        req.setHeader('Content-Type', 'application/json');
        req.write(JSON.stringify(body));
      }
    }
    req.end();
  });
}

// Multipart form-data builder for file upload tests
function createMultipartPayload(fieldName, fileName, fileContent, extraFields = {}) {
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  let body = '';

  for (const [key, val] of Object.entries(extraFields)) {
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
    body += `${val}\r\n`;
  }

  body += `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="${fieldName}"; filename="${fileName}"\r\n`;
  body += `Content-Type: application/octet-stream\r\n\r\n`;

  const header = Buffer.from(body, 'utf-8');
  const content = Buffer.isBuffer(fileContent) ? fileContent : Buffer.from(fileContent, 'utf-8');
  const footer = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf-8');

  return {
    boundary,
    buffer: Buffer.concat([header, content, footer])
  };
}

test('API Integration Test Suite', async (t) => {
  // Dynamically import and spin up backend server on test port 5099
  process.env.PORT = '5099';
  const { default: express } = await import('express');
  const { connectDB } = await import('../config/db.js');
  const { seedMongoIfEmpty } = await import('../utils/dataStore.js');

  const { default: authRoutes } = await import('../routes/authRoutes.js');
  const { default: userRoutes } = await import('../routes/userRoutes.js');
  const { default: resumeRoutes } = await import('../routes/resumeRoutes.js');
  const { default: analysisRoutes } = await import('../routes/analysisRoutes.js');
  const { default: atsRoutes } = await import('../routes/atsRoutes.js');
  const { default: jobMatchRoutes } = await import('../routes/jobMatchRoutes.js');

  const app = express();
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Mount routes
  app.get('/health', (req, res) => res.json({ status: 'healthy' }));
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/resumes', resumeRoutes);
  app.use('/api/analysis', analysisRoutes);
  app.use('/api/ats', atsRoutes);
  app.use('/api/job-match', jobMatchRoutes);

  // Global Error Handler
  app.use((err, req, res, next) => {
    let status = err.status || 500;
    let message = err.message || 'Internal Server Error';
    if (err.code === 'LIMIT_FILE_SIZE') {
      status = 413;
      message = 'File size exceeds 10MB limit.';
    } else if (err.message && err.message.toLowerCase().includes('invalid file type')) {
      status = 400;
      message = err.message;
    }
    res.status(status).json({ success: false, message });
  });

  await connectDB();
  await seedMongoIfEmpty();

  const server = await new Promise(resolve => {
    const s = app.listen(5099, () => resolve(s));
  });

  let authToken = '';
  let uploadedResumeId = '';

  await t.test('1. Health Check Endpoint', async () => {
    const res = await request(5099, { path: '/health', method: 'GET' });
    assert.equal(res.status, 200);
    assert.equal(res.data.status, 'healthy');
  });

  await t.test('2. Auth Registration & Validation', async () => {
    // Missing fields should return 400
    const failRes = await request(5099, { path: '/api/auth/register', method: 'POST' }, { email: '' });
    assert.equal(failRes.status, 400);

    // Valid registration
    const testEmail = `tester_${Date.now()}@example.com`;
    const regRes = await request(5099, { path: '/api/auth/register', method: 'POST' }, {
      name: 'QA Tester',
      email: testEmail,
      password: 'TestPassword123!',
      targetRole: 'Senior QA Engineer'
    });
    assert.equal(regRes.status, 201);
    assert.equal(regRes.data.success, true);
    assert.equal(regRes.data.requiresVerification, true);
  });

  await t.test('3. Auth Login with Verified Demo User', async () => {
    // Bad password should return 401
    const badPass = await request(5099, { path: '/api/auth/login', method: 'POST' }, {
      email: 'alex.morgan@techcareer.io',
      password: 'WrongPassword'
    });
    assert.equal(badPass.status, 401);

    // Correct password should return 200 with JWT
    const goodLogin = await request(5099, { path: '/api/auth/login', method: 'POST' }, {
      email: 'alex.morgan@techcareer.io',
      password: 'Password123!'
    });
    assert.equal(goodLogin.status, 200);
    assert.ok(goodLogin.data.token);
    assert.equal(goodLogin.data.user.email, 'alex.morgan@techcareer.io');
    authToken = goodLogin.data.token;
  });

  await t.test('4. Resume Upload - Reject Empty Input (400)', async () => {
    const res = await request(5099, {
      path: '/api/resumes/upload',
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` }
    }, {});
    assert.equal(res.status, 400);
    assert.ok(res.data.message.includes('No resume file provided'));
  });

  await t.test('5. Resume Upload - Reject Invalid File Type (400)', async () => {
    const payload = createMultipartPayload('resume', 'malicious.exe', 'MZ... executable content');
    const res = await request(5099, {
      path: '/api/resumes/upload',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${payload.boundary}`,
        'Content-Length': payload.buffer.length,
        Authorization: `Bearer ${authToken}`
      }
    }, payload.buffer);
    assert.equal(res.status, 400);
    assert.ok(res.data.message.includes('Invalid file type'));
  });

  await t.test('6. Resume Upload - Reject Corrupted Document (400)', async () => {
    const payload = createMultipartPayload('resume', 'corrupted_file.pdf', 'NOT_VALID_PDF_STRUCTURE');
    const res = await request(5099, {
      path: '/api/resumes/upload',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${payload.boundary}`,
        'Content-Length': payload.buffer.length,
        Authorization: `Bearer ${authToken}`
      }
    }, payload.buffer);
    assert.equal(res.status, 400);
    assert.ok(res.data.message.includes('Could not extract readable text'));
  });

  await t.test('7. Resume Upload - Successful Upload with Job Description (201)', async () => {
    const payload = createMultipartPayload(
      'resume',
      'Alex_Morgan_Senior_Engineer_2026.pdf',
      '%PDF-1.4 Mock Senior Full Stack Engineer Resume',
      {
        isSample: 'true',
        jobDescription: JSON.stringify({
          title: 'Senior Full Stack Engineer',
          company: 'Stripe',
          experienceLevel: 'Senior',
          text: 'We are seeking a Senior Full Stack Engineer with strong experience in React, TypeScript, Node.js, and AWS.',
          requiredSkills: ['React', 'TypeScript', 'Node.js', 'AWS']
        })
      }
    );
    const res = await request(5099, {
      path: '/api/resumes/upload',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${payload.boundary}`,
        'Content-Length': payload.buffer.length,
        Authorization: `Bearer ${authToken}`
      }
    }, payload.buffer);
    assert.equal(res.status, 201);
    assert.ok(res.data.id);
    assert.ok(res.data.overallScore >= 70);
    assert.ok(res.data.atsScore >= 70);
    assert.ok(res.data.jobMatchScore >= 70);
    assert.equal(res.data.targetJobTitle, 'Senior Full Stack Engineer');
    uploadedResumeId = res.data.id;
  });

  await t.test('7b. Resume Upload - Resume Only Mode without Job Details (201)', async () => {
    const payload = createMultipartPayload(
      'resume',
      'Alex_Morgan_Senior_Engineer_2026.pdf',
      '%PDF-1.4 Mock Senior Full Stack Engineer Resume',
      { isSample: 'true' }
    );
    const res = await request(5099, {
      path: '/api/resumes/upload',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${payload.boundary}`,
        'Content-Length': payload.buffer.length,
        Authorization: `Bearer ${authToken}`
      }
    }, payload.buffer);
    assert.equal(res.status, 201);
    assert.ok(res.data.id);
    assert.ok(res.data.overallScore >= 70);
    assert.ok(res.data.atsScore >= 70);
    assert.equal(res.data.jobMatchScore, null);
    assert.equal(res.data.targetJobTitle, 'General Role (Resume Only)');

    // Verify job-match endpoint returns hasJobMatch: false
    const jmCheck = await request(5099, { path: `/api/job-match/${res.data.id}`, method: 'GET' });
    assert.equal(jmCheck.status, 200);
    assert.equal(jmCheck.data.hasJobMatch, false);
    assert.equal(jmCheck.data.jobMatchScore, null);
  });

  await t.test('7c. Resume Upload - Reject Missing or Whitespace-Only Target Job Title (400)', async () => {
    const payload = createMultipartPayload(
      'resume',
      'Alex_Morgan_Senior_Engineer_2026.pdf',
      '%PDF-1.4 Mock Senior Full Stack Engineer Resume',
      {
        isSample: 'true',
        jobDescription: JSON.stringify({
          title: '   ',
          experienceLevel: 'Senior',
          text: 'Valid job text'
        })
      }
    );
    const res = await request(5099, {
      path: '/api/resumes/upload',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${payload.boundary}`,
        'Content-Length': payload.buffer.length,
        Authorization: `Bearer ${authToken}`
      }
    }, payload.buffer);
    assert.equal(res.status, 400);
    assert.ok(res.data.message.includes('Target Job Title is required'));
  });

  await t.test('7d. Resume Upload - Reject Invalid Experience Level (400)', async () => {
    const payload = createMultipartPayload(
      'resume',
      'Alex_Morgan_Senior_Engineer_2026.pdf',
      '%PDF-1.4 Mock Senior Full Stack Engineer Resume',
      {
        isSample: 'true',
        jobDescription: JSON.stringify({
          title: 'Software Engineer',
          experienceLevel: 'ExecutiveVP',
          text: 'Valid job text'
        })
      }
    );
    const res = await request(5099, {
      path: '/api/resumes/upload',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${payload.boundary}`,
        'Content-Length': payload.buffer.length,
        Authorization: `Bearer ${authToken}`
      }
    }, payload.buffer);
    assert.equal(res.status, 400);
    assert.ok(res.data.message.includes('Valid Experience Level is required'));
  });

  await t.test('7e. Resume Upload - Reject Missing Job Description Text (400)', async () => {
    const payload = createMultipartPayload(
      'resume',
      'Alex_Morgan_Senior_Engineer_2026.pdf',
      '%PDF-1.4 Mock Senior Full Stack Engineer Resume',
      {
        isSample: 'true',
        jobDescription: JSON.stringify({
          title: 'Software Engineer',
          experienceLevel: 'Mid-Level',
          text: '   '
        })
      }
    );
    const res = await request(5099, {
      path: '/api/resumes/upload',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${payload.boundary}`,
        'Content-Length': payload.buffer.length,
        Authorization: `Bearer ${authToken}`
      }
    }, payload.buffer);
    assert.equal(res.status, 400);
    assert.ok(res.data.message.includes('Job Description text is required'));
  });

  await t.test('8. Resume History & Retrieval', async () => {
    const listRes = await request(5099, {
      path: '/api/resumes/history',
      method: 'GET',
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert.equal(listRes.status, 200);
    assert.ok(Array.isArray(listRes.data));
    assert.ok(listRes.data.length >= 1);

    const getRes = await request(5099, { path: `/api/resumes/${uploadedResumeId}`, method: 'GET' });
    assert.equal(getRes.status, 200);
    assert.equal(getRes.data.id, uploadedResumeId);
  });

  await t.test('9. Analysis Service - Fetch, Reanalyze & Compare', async () => {
    const anlRes = await request(5099, { path: `/api/analysis/${uploadedResumeId}`, method: 'GET' });
    assert.equal(anlRes.status, 200);
    assert.ok(anlRes.data.scores);
    assert.ok(anlRes.data.sections);
    assert.ok(anlRes.data.feedback);

    const reanlRes = await request(5099, { path: `/api/analysis/${uploadedResumeId}/reanalyze`, method: 'POST' });
    assert.equal(reanlRes.status, 200);
    assert.ok(reanlRes.data.scores.overall);

    const compareRes = await request(5099, { path: `/api/analysis/compare?v1=res_001&v2=res_002`, method: 'GET' });
    assert.equal(compareRes.status, 200);
    assert.ok(compareRes.data.differences);
  });

  await t.test('10. ATS Service - Compliance & Keywords', async () => {
    const atsRes = await request(5099, { path: `/api/ats/${uploadedResumeId}`, method: 'GET' });
    assert.equal(atsRes.status, 200);
    assert.ok(atsRes.data.atsScore);
    assert.ok(atsRes.data.formattingAudit);

    const kwRes = await request(5099, { path: `/api/ats/${uploadedResumeId}/keywords`, method: 'GET' });
    assert.equal(kwRes.status, 200);
    assert.ok(Array.isArray(kwRes.data.matched));
  });

  await t.test('11. Job Match Service - Match & On-The-Fly Score', async () => {
    const jmRes = await request(5099, { path: `/api/job-match/${uploadedResumeId}`, method: 'GET' });
    assert.equal(jmRes.status, 200);
    assert.ok(jmRes.data.jobMatchScore);

    const evalRes = await request(5099, {
      path: `/api/job-match/${uploadedResumeId}/match`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { jobText: 'Required: React, TypeScript, Node.js, AWS' });
    assert.equal(evalRes.status, 200);
    assert.ok(evalRes.data.matchScore);
    assert.ok(Array.isArray(evalRes.data.skillsIdentified));
  });

  await t.test('12. Rename & Delete Resume', async () => {
    const renameRes = await request(5099, {
      path: `/api/resumes/${uploadedResumeId}/rename`,
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    }, { fileName: 'Updated_Resume_Title.pdf' });
    assert.equal(renameRes.status, 200);
    assert.equal(renameRes.data.fileName, 'Updated_Resume_Title.pdf');

    const delRes = await request(5099, { path: `/api/resumes/${uploadedResumeId}`, method: 'DELETE' });
    assert.equal(delRes.status, 200);
    assert.equal(delRes.data.success, true);
  });

  // Teardown test server and database connection
  await new Promise(resolve => server.close(resolve));
  const { default: mongoose } = await import('mongoose');
  await mongoose.disconnect();
});
