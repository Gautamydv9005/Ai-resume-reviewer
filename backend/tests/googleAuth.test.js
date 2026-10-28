import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';

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
      req.setHeader('Content-Type', 'application/json');
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

test('Google OAuth Security & Token Verification Test Suite', async (t) => {
  process.env.NODE_ENV = 'test';
  process.env.PORT = '5098';
  process.env.GOOGLE_CLIENT_ID = 'test_google_client_id_12345.apps.googleusercontent.com';

  const { default: express } = await import('express');
  const { connectDB } = await import('../config/db.js');
  const { default: authRoutes } = await import('../routes/authRoutes.js');

  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);

  await connectDB();

  const server = await new Promise(resolve => {
    const s = app.listen(5098, () => resolve(s));
  });

  await t.test('1. Rejects request with missing token (HTTP 400)', async () => {
    const res = await request(5098, {
      path: '/api/auth/google',
      method: 'POST'
    }, {
      // Trying to impersonate an email without a token
      email: 'victim@targetcompany.com'
    });

    assert.equal(res.status, 400);
    assert.equal(res.data.success, false);
    assert.ok(res.data.message.includes('token is required'));
  });

  await t.test('2. Rejects request with empty whitespace token (HTTP 400)', async () => {
    const res = await request(5098, {
      path: '/api/auth/google',
      method: 'POST'
    }, {
      credential: '   '
    });

    assert.equal(res.status, 400);
    assert.equal(res.data.success, false);
  });

  await t.test('3. Rejects invalid or forged JWT ID token (HTTP 401)', async () => {
    // Forged JWT token format
    const fakeIdToken = 'eyJhbGciOiJSUzI1NiJ9.eyJlbWFpbCI6ImF0dGFja2VyQGhhY2suY29tIiwic3ViIjoiMTIzIn0.fake_signature';
    const res = await request(5098, {
      path: '/api/auth/google',
      method: 'POST'
    }, {
      idToken: fakeIdToken
    });

    assert.equal(res.status, 401);
    assert.equal(res.data.success, false);
    assert.ok(res.data.message.toLowerCase().includes('google id token verification failed') || res.data.message.toLowerCase().includes('invalid'));
  });

  await t.test('4. Rejects invalid or expired OAuth access token (HTTP 401)', async () => {
    const fakeAccessToken = 'ya29.fake_expired_access_token_xyz987';
    const res = await request(5098, {
      path: '/api/auth/google',
      method: 'POST'
    }, {
      token: fakeAccessToken
    });

    assert.equal(res.status, 401);
    assert.equal(res.data.success, false);
    assert.ok(res.data.message.toLowerCase().includes('google access token verification failed') || res.data.message.toLowerCase().includes('invalid'));
  });

  await t.test('5. Derives user identity strictly from verified token, ignoring client body claims', async () => {
    // Submit a verified test token with an attacker attempt in body to override email
    const testToken = `mock_test_google_token_verified_jordan.test${Date.now()}@gmail.com`;
    const res = await request(5098, {
      path: '/api/auth/google',
      method: 'POST'
    }, {
      token: testToken,
      // Attempt to spoof email in body
      email: 'admin_victim@enterprise.com',
      name: 'Spoofed Admin'
    });

    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.ok(res.data.token, 'Must return session JWT');
    // The user email must be the verified token email, NOT the spoofed admin_victim@enterprise.com!
    assert.notEqual(res.data.user.email, 'admin_victim@enterprise.com');
    assert.ok(res.data.user.email.includes('jordan.test'));
    assert.equal(res.data.user.isVerified, true);
    assert.equal(res.data.user.provider, 'Google');
  });

  // Teardown
  await new Promise(resolve => server.close(resolve));
  const { default: mongoose } = await import('mongoose');
  await mongoose.disconnect();
});
