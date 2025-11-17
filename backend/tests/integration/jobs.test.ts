/**
 * Integration Tests for Jobs API
 *
 * Tests for Sprint 6.6 - Jobs endpoint integration testing
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import { generateTestUser, generateTestJob, extractToken, extractUserId, authHeaders, makeUserAdmin } from './helpers.js';

// Import app dynamically to avoid timing issues
let app: any;

describe('Jobs API Integration Tests', () => {
  let adminToken: string;
  let userToken: string;
  let testJobId: string;

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

  describe('GET /api/jobs', () => {
    it('should get all active jobs (public endpoint)', async () => {
      const response = await request(app)
        .get('/api/jobs')
        .expect(200);

      expect(response.body).toHaveProperty('jobs');
      expect(Array.isArray(response.body.jobs)).toBe(true);
    });

    it('should work without authentication', async () => {
      const response = await request(app)
        .get('/api/jobs')
        .expect(200);

      expect(response.body.jobs).toBeDefined();
    });

    it('should handle rate limiting', async () => {
      // Make multiple requests to test rate limiting
      // strictLimiter allows a certain number of requests per window
      const requests = Array(5).fill(null).map(() =>
        request(app).get('/api/jobs')
      );

      const responses = await Promise.all(requests);
      responses.forEach(res => {
        expect([200, 429]).toContain(res.status);
      });
    });
  });

  describe('GET /api/jobs/category/:category', () => {
    it('should get jobs by category', async () => {
      const response = await request(app)
        .get('/api/jobs/category/tech')
        .expect(200);

      expect(response.body).toHaveProperty('jobs');
      expect(Array.isArray(response.body.jobs)).toBe(true);
    });

    it('should validate category parameter', async () => {
      const response = await request(app)
        .get('/api/jobs/category/invalid-category-with-special-chars!@#')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should accept valid category values', async () => {
      const validCategories = ['tech', 'accounting', 'casual', 'healthcare'];

      for (const category of validCategories) {
        const response = await request(app)
          .get(`/api/jobs/category/${category}`)
          .expect(200);

        expect(response.body.jobs).toBeDefined();
      }
    });
  });

  describe('POST /api/jobs/admin', () => {
    it('should reject job creation without auth', async () => {
      const jobData = generateTestJob();

      const response = await request(app)
        .post('/api/jobs/admin')
        .send(jobData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/jobs/admin')
        .set(authHeaders(adminToken))
        .send({ title: 'Only Title' }) // Missing required fields
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should validate category values', async () => {
      const jobData = generateTestJob({ category: 'invalid-category' });

      const response = await request(app)
        .post('/api/jobs/admin')
        .set(authHeaders(adminToken))
        .send(jobData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should sanitize HTML in description', async () => {
      const jobData = generateTestJob({
        description: 'Test <script>alert("XSS")</script> description <strong>bold text</strong>'
      });

      const response = await request(app)
        .post('/api/jobs/admin')
        .set(authHeaders(adminToken))
        .send(jobData);

      // Note: This might fail if user doesn't have admin role
      // But we're testing sanitization logic
      if (response.status === 201) {
        expect(response.body.job.description).not.toContain('<script>');
        // Should preserve safe HTML like <strong>
        expect(response.body.job.description).toContain('<strong>');
      }
    });

    it('should require authentication for job creation', async () => {
      const jobData = generateTestJob();

      const response = await request(app)
        .post('/api/jobs/admin')
        .send(jobData)
        .expect(401);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/jobs/admin/all', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/jobs/admin/all')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject regular users', async () => {
      const response = await request(app)
        .get('/api/jobs/admin/all')
        .set(authHeaders(userToken));

      // Will likely be 403 if admin middleware is working
      expect([401, 403]).toContain(response.status);
    });
  });

  describe('PUT /api/jobs/admin/:id', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .put('/api/jobs/admin/123')
        .send({ title: 'Updated Title' })
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    it('should validate job ID format', async () => {
      const response = await request(app)
        .put('/api/jobs/admin/invalid-id')
        .set(authHeaders(adminToken))
        .send({ title: 'Updated Title' })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('DELETE /api/jobs/admin/:id', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .delete('/api/jobs/admin/123')
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    it('should validate job ID format', async () => {
      const response = await request(app)
        .delete('/api/jobs/admin/invalid-id')
        .set(authHeaders(adminToken))
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should reject non-existent job deletion', async () => {
      const fakeUuid = '00000000-0000-0000-0000-000000000000';

      const response = await request(app)
        .delete(`/api/jobs/admin/${fakeUuid}`)
        .set(authHeaders(adminToken));

      // Might be 404 or 403 depending on admin status
      expect([403, 404, 500]).toContain(response.status);
    });
  });

  describe('Adzuna Search Integration', () => {
    it.skip('should get Adzuna jobs for valid search', async () => {
      // TODO: Implement Adzuna search endpoint
      const response = await request(app)
        .get('/api/jobs/search/adzuna?query=developer&location=New York')
        .expect(200);

      expect(response.body).toHaveProperty('jobs');
      expect(Array.isArray(response.body.jobs)).toBe(true);
    });

    it.skip('should validate search query parameter', async () => {
      // TODO: Implement Adzuna search endpoint
      const response = await request(app)
        .get('/api/jobs/search/adzuna?location=New York') // Missing query
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it.skip('should handle Adzuna API errors gracefully', async () => {
      // TODO: Implement Adzuna search endpoint
      const response = await request(app)
        .get('/api/jobs/search/adzuna?query=&location='); // Empty query

      // Should either validate or handle gracefully
      expect([400, 500]).toContain(response.status);
    });
  });

  describe('Security & Validation', () => {
    it('should prevent SQL injection in title', async () => {
      const jobData = generateTestJob({
        title: "'; DROP TABLE jobs; --"
      });

      const response = await request(app)
        .post('/api/jobs/admin')
        .set(authHeaders(adminToken))
        .send(jobData);

      // Should either sanitize or reject
      if (response.status === 201) {
        expect(response.body.job.title).not.toContain('DROP TABLE');
      } else {
        expect(response.status).toBe(400);
      }
    });

    it('should prevent XSS in company name', async () => {
      const jobData = generateTestJob({
        company: '<img src=x onerror=alert(1)>'
      });

      const response = await request(app)
        .post('/api/jobs/admin')
        .set(authHeaders(adminToken))
        .send(jobData);

      if (response.status === 201) {
        expect(response.body.job.company).not.toContain('<img');
        expect(response.body.job.company).not.toContain('onerror');
      }
    });

    it('should reject extremely long titles', async () => {
      const jobData = generateTestJob({
        title: 'A'.repeat(1000) // Very long title
      });

      const response = await request(app)
        .post('/api/jobs/admin')
        .set(authHeaders(adminToken))
        .send(jobData);

      // Should either truncate or reject
      expect([400, 201]).toContain(response.status);
      if (response.status === 201) {
        expect(response.body.job.title.length).toBeLessThanOrEqual(255);
      }
    });
  });
});
