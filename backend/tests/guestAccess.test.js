import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to make HTTP requests with support for headers and cookies
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

test('Guest Access & One-Time Review Security Test Suite', async (t) => {
  process.env.NODE_ENV = 'test';
  process.env.PORT = '5097';

  const { default: express } = await import('express');
  const { connectDB } = await import('../config/db.js');
  const { seedMongoIfEmpty } = await import('../utils/dataStore.js');

  const { default: authRoutes } = await import('../routes/authRoutes.js');
  const { default: resumeRoutes } = await import('../routes/resumeRoutes.js');

  const app = express();
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Cookie parser middleware (matching server.js)
  app.use((req, res, next) => {
    const cookieHeader = req.headers.cookie;
    req.cookies = {};
    if (cookieHeader) {
      cookieHeader.split(';').forEach(cookie => {
        const parts = cookie.split('=');
        if (parts.length >= 2) {
          const name = parts[0].trim();
          const value = parts.slice(1).join('=').trim();
          req.cookies[name] = decodeURIComponent(value);
        }
      });
    }
    next();
  });

  // Mount routes
  app.use('/api/auth', authRoutes);
  app.use('/api/resumes', resumeRoutes);

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
    const s = app.listen(5097, () => resolve(s));
  });



  let guestToken1 = null;
  let guestCookie1 = null;
  let firstCompletedResumeId = null;

  await t.test('1. Guest session initialization returns token, canReview: true, and sets httpOnly cookie', async () => {
    const res = await request(5097, {
      path: '/api/auth/guest-session',
      method: 'POST'
    });

    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.ok(res.data.guestToken, 'Guest token should be generated');
    assert.equal(res.data.reviewsUsed, 0, 'New guest should have 0 reviews used');
    assert.equal(res.data.canReview, true, 'New guest should have canReview = true');

    // Verify Set-Cookie header
    const setCookie = res.headers['set-cookie'];
    assert.ok(setCookie, 'Should include Set-Cookie header');
    const cookieStr = Array.isArray(setCookie) ? setCookie[0] : setCookie;
    assert.ok(cookieStr.includes('resumate_guest_session'), 'Cookie name should be resumate_guest_session');
    assert.ok(cookieStr.toLowerCase().includes('httponly'), 'Cookie should be HttpOnly');

    guestToken1 = res.data.guestToken;
    guestCookie1 = cookieStr.split(';')[0]; // e.g. resumate_guest_session=<token>
  });

  await t.test('2. First guest review succeeds (HTTP 201) and completes full ATS/AI evaluation', async () => {
    const payload = createMultipartPayload(
      'resume',
      'Guest_Sample_Resume.pdf',
      '%PDF-1.4 Mock Senior Full Stack Engineer Resume',
      { isSample: 'true', targetJobTitle: 'Full Stack Engineer' }
    );

    const res = await request(5097, {
      path: '/api/resumes/upload',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${payload.boundary}`,
        'Content-Length': payload.buffer.length,
        'x-guest-token': guestToken1
      }
    }, payload.buffer);

    assert.equal(res.status, 201);
    assert.ok(res.data.id, 'Should return generated resume id');
    assert.ok(typeof res.data.overallScore === 'number' && res.data.overallScore > 0, 'Should return overallScore');
    assert.ok(typeof res.data.atsScore === 'number' && res.data.atsScore > 0, 'Should return atsScore');
    assert.equal(res.data.status, 'Completed');
    assert.equal(res.data.isGuest, true);

    firstCompletedResumeId = res.data.id;
  });

  await t.test('3. Guest session status updates to reviewsUsed = 1 and canReview = false', async () => {
    const res = await request(5097, {
      path: '/api/auth/guest-session',
      method: 'GET',
      headers: {
        'x-guest-token': guestToken1
      }
    });

    assert.equal(res.status, 200);
    assert.equal(res.data.reviewsUsed, 1);
    assert.equal(res.data.canReview, false);
    assert.equal(res.data.completedResumeId, firstCompletedResumeId);
  });

  await t.test('4. Second guest review attempt is blocked on backend with HTTP 403 Forbidden', async () => {
    const payload = createMultipartPayload(
      'resume',
      'Second_Resume_Attempt.pdf',
      '%PDF-1.4 Another Resume',
      { isSample: 'true' }
    );

    const res = await request(5097, {
      path: '/api/resumes/upload',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${payload.boundary}`,
        'Content-Length': payload.buffer.length,
        'x-guest-token': guestToken1
      }
    }, payload.buffer);

    assert.equal(res.status, 403);
    assert.equal(res.data.success, false);
    assert.equal(res.data.limitReached, true);
    assert.ok(
      res.data.message.includes('free resume review is complete') ||
      res.data.message.includes('free guest review limit'),
      `Expected free guest review message: ${res.data.message}`
    );
    assert.equal(res.data.completedResumeId, firstCompletedResumeId);
  });

  await t.test('5. Page refresh or opening new tab with cookie preserves session and prevents limit reset', async () => {
    // Simulate browser opening new tab: no x-guest-token header, only Cookie header sent by browser
    const getSession = await request(5097, {
      path: '/api/auth/guest-session',
      method: 'GET',
      headers: {
        Cookie: guestCookie1
      }
    });

    assert.equal(getSession.status, 200);
    assert.equal(getSession.data.reviewsUsed, 1);
    assert.equal(getSession.data.canReview, false);
    assert.equal(getSession.data.completedResumeId, firstCompletedResumeId);

    // Submitting via cookie only is also blocked with 403
    const payload = createMultipartPayload(
      'resume',
      'New_Tab_Attempt.pdf',
      '%PDF-1.4 Tab Attempt',
      { isSample: 'true' }
    );

    const uploadRes = await request(5097, {
      path: '/api/resumes/upload',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${payload.boundary}`,
        'Content-Length': payload.buffer.length,
        Cookie: guestCookie1
      }
    }, payload.buffer);

    assert.equal(uploadRes.status, 403);
    assert.equal(uploadRes.data.limitReached, true);
  });

  await t.test('6. Failed review attempts (e.g. invalid format or empty input) DO NOT consume the allowance', async () => {
    // Create a new fresh guest session
    const sessionRes = await request(5097, {
      path: '/api/auth/guest-session',
      method: 'POST'
    });
    const freshGuestToken = sessionRes.data.guestToken;
    assert.equal(sessionRes.data.reviewsUsed, 0);

    // Attempt 1: Malformed corrupted document (fails text extraction with 400)
    const corruptPayload = createMultipartPayload('resume', 'broken.pdf', 'NOT_VALID_PDF_STRUCTURE');
    const failRes1 = await request(5097, {
      path: '/api/resumes/upload',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${corruptPayload.boundary}`,
        'Content-Length': corruptPayload.buffer.length,
        'x-guest-token': freshGuestToken
      }
    }, corruptPayload.buffer);

    assert.equal(failRes1.status, 400);

    // Check status: allowance MUST NOT be consumed
    let statusCheck = await request(5097, {
      path: '/api/auth/guest-session',
      method: 'GET',
      headers: { 'x-guest-token': freshGuestToken }
    });
    assert.equal(statusCheck.data.reviewsUsed, 0, 'reviewsUsed should remain 0 after failed attempt');
    assert.equal(statusCheck.data.canReview, true, 'canReview should remain true after failed attempt');

    // Attempt 2: Now upload a valid resume
    const validPayload = createMultipartPayload(
      'resume',
      'Valid_Retry_Resume.pdf',
      '%PDF-1.4 Valid Document',
      { isSample: 'true' }
    );
    const successRes = await request(5097, {
      path: '/api/resumes/upload',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${validPayload.boundary}`,
        'Content-Length': validPayload.buffer.length,
        'x-guest-token': freshGuestToken
      }
    }, validPayload.buffer);

    assert.equal(successRes.status, 201, 'Valid upload after failed attempt must succeed');

    // Check status: now allowance IS consumed
    statusCheck = await request(5097, {
      path: '/api/auth/guest-session',
      method: 'GET',
      headers: { 'x-guest-token': freshGuestToken }
    });
    assert.equal(statusCheck.data.reviewsUsed, 1, 'reviewsUsed should now be 1');
    assert.equal(statusCheck.data.canReview, false);
  });

  await t.test('7. Concurrent submissions cannot bypass the one-review limit', async () => {
    // Create a fresh guest session
    const sessionRes = await request(5097, {
      path: '/api/auth/guest-session',
      method: 'POST'
    });
    const concurrentGuestToken = sessionRes.data.guestToken;

    const payloadA = createMultipartPayload('resume', 'Concurrent_A.pdf', '%PDF-1.4 Req A', { isSample: 'true' });
    const payloadB = createMultipartPayload('resume', 'Concurrent_B.pdf', '%PDF-1.4 Req B', { isSample: 'true' });

    // Send 2 requests simultaneously with the same guest token
    const [resA, resB] = await Promise.all([
      request(5097, {
        path: '/api/resumes/upload',
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${payloadA.boundary}`,
          'Content-Length': payloadA.buffer.length,
          'x-guest-token': concurrentGuestToken
        }
      }, payloadA.buffer),
      request(5097, {
        path: '/api/resumes/upload',
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${payloadB.boundary}`,
          'Content-Length': payloadB.buffer.length,
          'x-guest-token': concurrentGuestToken
        }
      }, payloadB.buffer)
    ]);

    const statuses = [resA.status, resB.status];
    // Exactly ONE request must succeed with 201
    const successCount = statuses.filter(s => s === 201).length;
    assert.equal(successCount, 1, `Exactly one concurrent request should succeed with 201, got statuses: ${statuses.join(', ')}`);

    // The other request should be rejected (429 concurrency lock or 403 limit reached)
    const blockedCount = statuses.filter(s => s === 429 || s === 403).length;
    assert.equal(blockedCount, 1, `The other request should be blocked (429 or 403), got statuses: ${statuses.join(', ')}`);

    // Status check: reviewsUsed must be exactly 1
    const statusCheck = await request(5097, {
      path: '/api/auth/guest-session',
      method: 'GET',
      headers: { 'x-guest-token': concurrentGuestToken }
    });
    assert.equal(statusCheck.data.reviewsUsed, 1);
  });

  await t.test('8. Authenticated registered users are NOT restricted by guest limits', async () => {
    // Log in as registered user
    const loginRes = await request(5097, {
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'alex.morgan@techcareer.io',
      password: 'Password123!'
    });

    assert.equal(loginRes.status, 200);
    const authToken = loginRes.data.token;
    assert.ok(authToken);

    // Upload first resume
    const payload1 = createMultipartPayload('resume', 'Auth_User_Resume_1.pdf', '%PDF-1.4 Resume 1', { isSample: 'true' });
    const res1 = await request(5097, {
      path: '/api/resumes/upload',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${payload1.boundary}`,
        'Content-Length': payload1.buffer.length,
        Authorization: `Bearer ${authToken}`
      }
    }, payload1.buffer);
    assert.equal(res1.status, 201);

    // Upload second resume with same authenticated user — must ALSO succeed (not blocked by guest limit)
    const payload2 = createMultipartPayload('resume', 'Auth_User_Resume_2.pdf', '%PDF-1.4 Resume 2', { isSample: 'true' });
    const res2 = await request(5097, {
      path: '/api/resumes/upload',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${payload2.boundary}`,
        'Content-Length': payload2.buffer.length,
        Authorization: `Bearer ${authToken}`
      }
    }, payload2.buffer);
    assert.equal(res2.status, 201, 'Authenticated user should be allowed multiple reviews');
  });

  // Teardown
  await new Promise(resolve => server.close(resolve));
  const { default: mongoose } = await import('mongoose');
  await mongoose.disconnect();
});
