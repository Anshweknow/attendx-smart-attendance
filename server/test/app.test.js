process.env.JWT_SECRET = 'test-secret'; const test = require('node:test'); const assert = require('node:assert/strict'); const request = require('supertest'); const app = require('../src/app');
test('health endpoint is public', async () => { const response = await request(app).get('/api/health'); assert.equal(response.status, 200); assert.equal(response.body.success, true); });
test('protected endpoint requires a token', async () => { const response = await request(app).get('/api/auth/me'); assert.equal(response.status, 401); });
