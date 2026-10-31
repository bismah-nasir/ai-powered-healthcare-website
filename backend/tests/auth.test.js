import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { useTestDatabase, createUser } from './helpers.js';
import app from '../app.js';
import User from '../models/User.js';

useTestDatabase();

describe('POST /api/auth/signup', () => {
  it('creates a patient account and returns a token without the password', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Ali Khan', email: 'Ali@Example.com', password: 'secret123', role: 'admin' });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.email, 'ali@example.com');
    assert.equal(res.body.data.role, 'patient', 'role sent by the client must be ignored');
    assert.ok(res.body.data.token);
    assert.equal(res.body.data.password, undefined);

    const saved = await User.findOne({ email: 'ali@example.com' }).select('+password');
    assert.notEqual(saved.password, 'secret123', 'password must be stored hashed');
  });

  it('rejects an email that is already registered, ignoring case', async () => {
    await createUser({ email: 'taken@example.com' });

    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Someone Else', email: 'TAKEN@example.com', password: 'secret123' });

    assert.equal(res.status, 400);
    assert.match(res.body.message, /already exists/);
  });

  it('returns schema validation errors as 400', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Short Pass', email: 'short@example.com', password: '123' });

    assert.equal(res.status, 400);
    assert.match(res.body.message, /at least 6 characters/);
  });
});

describe('POST /api/auth/login', () => {
  it('logs in with the right password', async () => {
    await createUser({ email: 'login@example.com', password: 'password123' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: ' Login@Example.com ', password: 'password123' });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.email, 'login@example.com');
    assert.ok(res.body.data.token);
  });

  it('rejects a wrong password and an unknown email with the same message', async () => {
    await createUser({ email: 'login@example.com', password: 'password123' });

    const wrongPassword = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'wrong-password' });
    const unknownEmail = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'password123' });

    assert.equal(wrongPassword.status, 401);
    assert.equal(unknownEmail.status, 401);
    assert.equal(wrongPassword.body.message, unknownEmail.body.message);
  });

  it('rejects query operators instead of strings', async () => {
    await createUser({ email: 'login@example.com' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: { $ne: null }, password: { $ne: null } });

    assert.equal(res.status, 400);
  });
});

describe('GET /api/auth/profile', () => {
  it('returns the logged-in user', async () => {
    const { user, auth } = await createUser();

    const res = await request(app).get('/api/auth/profile').set(auth);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.email, user.email);
  });

  it('requires a valid token', async () => {
    const noToken = await request(app).get('/api/auth/profile');
    const badToken = await request(app).get('/api/auth/profile').set({ Authorization: 'Bearer not-a-real-token' });

    assert.equal(noToken.status, 401);
    assert.equal(badToken.status, 401);
  });
});
