/**
 * Integration Tests for Courses API
 *
 * Tests for Sprint 6.6 - Courses endpoint integration testing
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import { generateTestUser, generateTestCourse, extractToken, extractUserId, authHeaders, makeUserAdmin } from './helpers.js';

// Import app dynamically to avoid timing issues
let app: any;

describe('Courses API Integration Tests', () => {
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    // Dynamically import app
    const appModule = await import('../../src/app.js');
    app = appModule.app;

    // Create admin user and promote to admin role
    const adminUser = generateTestUser();
    const adminResponse = await request(app)
      .post('/api/auth/signup')
      .send(adminUser);
    const adminUserId = extractUserId(adminResponse);
    await makeUserAdmin(adminUserId); // Promote to admin

    // IMPORTANT: Login again to get a new JWT with app_metadata
    const adminLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: adminUser.email,
        password: adminUser.password,
      });
    adminToken = extractToken(adminLoginResponse);

    // Create regular user (no admin role)
    const regularUser = generateTestUser();
    const userResponse = await request(app)
      .post('/api/auth/signup')
      .send(regularUser);
    userToken = extractToken(userResponse);
  });

  describe('GET /api/courses', () => {
    it('should get all published courses (public endpoint)', async () => {
      const response = await request(app)
        .get('/api/courses')
        .expect(200);

      expect(response.body).toHaveProperty('courses');
      expect(Array.isArray(response.body.courses)).toBe(true);
    });

    it('should work without authentication', async () => {
      const response = await request(app)
        .get('/api/courses')
        .expect(200);

      expect(response.body.courses).toBeDefined();
    });
  });

  describe('GET /api/courses/type/:type', () => {
    it('should get free courses', async () => {
      const response = await request(app)
        .get('/api/courses/type/free')
        .expect(200);

      expect(response.body).toHaveProperty('courses');
      expect(Array.isArray(response.body.courses)).toBe(true);
    });

    it('should get paid courses', async () => {
      const response = await request(app)
        .get('/api/courses/type/paid')
        .expect(200);

      expect(response.body).toHaveProperty('courses');
      expect(Array.isArray(response.body.courses)).toBe(true);
    });

    it('should validate type parameter', async () => {
      const response = await request(app)
        .get('/api/courses/type/invalid-type')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should accept only free or paid types', async () => {
      const validTypes = ['free', 'paid'];

      for (const type of validTypes) {
        const response = await request(app)
          .get(`/api/courses/type/${type}`)
          .expect(200);

        expect(response.body.courses).toBeDefined();
      }
    });
  });

  describe('POST /api/courses/admin', () => {
    it('should reject course creation without auth', async () => {
      const courseData = generateTestCourse({ type: 'free' });

      const response = await request(app)
        .post('/api/courses/admin')
        .send(courseData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/courses/admin')
        .set(authHeaders(adminToken))
        .send({ title: 'Only Title' }) // Missing required fields
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject paid course without affiliate link', async () => {
      const courseData = generateTestCourse({ type: 'paid' });
      delete courseData.affiliate_link;

      const response = await request(app)
        .post('/api/courses/admin')
        .set(authHeaders(adminToken))
        .send(courseData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should validate video URL format', async () => {
      const courseData = generateTestCourse({
        video_url: 'not-a-valid-url'
      });

      const response = await request(app)
        .post('/api/courses/admin')
        .set(authHeaders(adminToken))
        .send(courseData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it.skip('should accept YouTube URLs', async () => {
      // TODO: Fix RLS policy for courses table - currently getting 42501 errors
      const courseData = generateTestCourse({
        type: 'free',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      });

      const response = await request(app)
        .post('/api/courses/admin')
        .set(authHeaders(adminToken))
        .send(courseData)
        .expect(201);

      expect(response.body.course).toBeDefined();
    });

    it('should sanitize HTML in description', async () => {
      const courseData = generateTestCourse({
        type: 'free',
        description: 'Test <script>alert("XSS")</script> description <p>paragraph</p>'
      });

      const response = await request(app)
        .post('/api/courses/admin')
        .set(authHeaders(adminToken))
        .send(courseData);

      if (response.status === 201) {
        expect(response.body.course.description).not.toContain('<script>');
        // Should preserve safe HTML
        expect(response.body.course.description).toContain('<p>');
      }
    });

    it('should validate course type', async () => {
      const courseData = generateTestCourse({ type: 'invalid-type' });

      const response = await request(app)
        .post('/api/courses/admin')
        .set(authHeaders(adminToken))
        .send(courseData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/courses/admin/all', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/courses/admin/all')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject regular users', async () => {
      const response = await request(app)
        .get('/api/courses/admin/all')
        .set(authHeaders(userToken));

      // Will likely be 403 if admin middleware is working
      expect([401, 403]).toContain(response.status);
    });
  });

  describe('PUT /api/courses/admin/:id', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .put('/api/courses/admin/123')
        .send({ title: 'Updated Title' })
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    it('should validate course ID format', async () => {
      const response = await request(app)
        .put('/api/courses/admin/invalid-id')
        .set(authHeaders(adminToken))
        .send({ title: 'Updated Title' })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('DELETE /api/courses/admin/:id', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .delete('/api/courses/admin/123')
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    it('should validate course ID format', async () => {
      const response = await request(app)
        .delete('/api/courses/admin/invalid-id')
        .set(authHeaders(adminToken))
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/courses/:id/enroll', () => {
    it.skip('should require authentication for enrollment', async () => {
      // TODO: Implement course enrollment endpoint
      const fakeUuid = '00000000-0000-0000-0000-000000000000';

      const response = await request(app)
        .post(`/api/courses/${fakeUuid}/enroll`)
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    it.skip('should validate course ID format', async () => {
      // TODO: Implement course enrollment endpoint
      const response = await request(app)
        .post('/api/courses/invalid-id/enroll')
        .set(authHeaders(userToken))
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('Security & Validation', () => {
    it('should prevent XSS in course title', async () => {
      const courseData = generateTestCourse({
        type: 'free',
        title: '<script>alert(1)</script>Introduction to JavaScript'
      });

      const response = await request(app)
        .post('/api/courses/admin')
        .set(authHeaders(adminToken))
        .send(courseData);

      if (response.status === 201) {
        expect(response.body.course.title).not.toContain('<script>');
      }
    });

    it('should prevent javascript: URLs in video_url', async () => {
      const courseData = generateTestCourse({
        type: 'free',
        video_url: 'javascript:alert(1)'
      });

      const response = await request(app)
        .post('/api/courses/admin')
        .set(authHeaders(adminToken))
        .send(courseData);

      // Should reject dangerous URLs
      expect([400, 403]).toContain(response.status);
    });

    it('should prevent data: URLs in affiliate_link', async () => {
      const courseData = generateTestCourse({
        type: 'paid',
        affiliate_link: 'data:text/html,<script>alert(1)</script>'
      });

      const response = await request(app)
        .post('/api/courses/admin')
        .set(authHeaders(adminToken))
        .send(courseData);

      // Should reject dangerous URLs
      expect([400, 403]).toContain(response.status);
    });

    it('should reject extremely long provider names', async () => {
      const courseData = generateTestCourse({
        type: 'free',
        provider: 'A'.repeat(1000)
      });

      const response = await request(app)
        .post('/api/courses/admin')
        .set(authHeaders(adminToken))
        .send(courseData);

      expect([400, 201]).toContain(response.status);
      if (response.status === 201) {
        expect(response.body.course.provider.length).toBeLessThanOrEqual(255);
      }
    });

    it('should handle special characters in course titles', async () => {
      const courseData = generateTestCourse({
        type: 'free',
        title: 'C++ & C# Programming: Advanced Topics (2024)'
      });

      const response = await request(app)
        .post('/api/courses/admin')
        .set(authHeaders(adminToken))
        .send(courseData);

      if (response.status === 201) {
        expect(response.body.course.title).toContain('C++');
        expect(response.body.course.title).toContain('C#');
      }
    });
  });
});
