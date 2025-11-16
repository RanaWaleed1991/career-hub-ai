/**
 * Integration Tests for Authentication API
 *
 * Tests for Sprint 6.6 - Auth endpoint integration testing
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { app } from '../../src/app.js';
import { generateTestUser, extractToken } from './helpers.js';

describe('Authentication API Integration Tests', () => {
  describe('POST /api/auth/signup', () => {
    it('should register new user successfully', async () => {
      const userData = generateTestUser();

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('session');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email');
      expect(response.body.user.email).toBe(userData.email);

      // Should have a session with access token
      expect(response.body.session).toHaveProperty('access_token');
      expect(response.body.session).toHaveProperty('refresh_token');
    });

    it('should reject weak password', async () => {
      const userData = generateTestUser({ password: 'weak' });

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject invalid email format', async () => {
      const userData = generateTestUser({ email: 'not-an-email' });

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'test@example.com' }) // Missing password
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject password without uppercase', async () => {
      const userData = generateTestUser({ password: 'lowercase123!' });

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should reject password without number', async () => {
      const userData = generateTestUser({ password: 'NoNumbers!' });

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should reject password that is too short', async () => {
      const userData = generateTestUser({ password: 'Short1!' });

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should trim and lowercase email', async () => {
      const userData = generateTestUser({ email: '  TEST@EXAMPLE.COM  ' });

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(201);

      expect(response.body.user.email).toBe('test@example.com');
    });
  });

  describe('POST /api/auth/login', () => {
    let testUser: any;

    beforeAll(async () => {
      // Create a test user for login tests
      testUser = generateTestUser();
      await request(app)
        .post('/api/auth/signup')
        .send(testUser);
    });

    it('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('session');
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.session).toHaveProperty('access_token');
    });

    it('should reject wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.toLowerCase()).toContain('invalid');
    });

    it('should reject non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'TestPass123!',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle case-insensitive email login', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email.toUpperCase(),
          password: testUser.password,
        })
        .expect(200);

      expect(response.body.user.email).toBe(testUser.email);
    });

    it('should lock account after 5 failed attempts', async () => {
      const userData = generateTestUser();
      await request(app).post('/api/auth/signup').send(userData);

      // Make 5 failed login attempts
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({
            email: userData.email,
            password: 'WrongPassword',
          })
          .expect(401);
      }

      // 6th attempt should be locked
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password, // Even with correct password
        })
        .expect(429);

      expect(response.body.error.toLowerCase()).toContain('locked');
    });

    it('should reject missing email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ password: 'TestPass123!' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should get current user with valid token', async () => {
      const userData = generateTestUser();
      const signupResponse = await request(app)
        .post('/api/auth/signup')
        .send(userData);

      const token = extractToken(signupResponse);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(userData.email);
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject malformed authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'NotBearer token')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully with valid token', async () => {
      const userData = generateTestUser();
      const signupResponse = await request(app)
        .post('/api/auth/signup')
        .send(userData);

      const token = extractToken(signupResponse);

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.message).toBeDefined();
    });

    it('should reject logout without token', async () => {
      await request(app)
        .post('/api/auth/logout')
        .expect(401);
    });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
});
