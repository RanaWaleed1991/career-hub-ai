/**
 * Integration Test Helpers
 *
 * Utilities for generating test data and managing test state
 */

import { faker } from '@faker-js/faker';

/**
 * Generate test user data
 * Uses mailinator.com for test emails to prevent Supabase bounce warnings
 * Mailinator accepts all emails without bouncing
 */
export function generateTestUser(overrides: any = {}) {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const timestamp = Date.now();
  const random = faker.string.alphanumeric(6);

  return {
    // Use mailinator.com to prevent email bounces during testing
    // Mailinator is a test email service that accepts all emails
    email: `test-${timestamp}-${random}@mailinator.com`,
    password: 'TestPass123!',  // Valid password meeting requirements
    fullName: `${firstName} ${lastName}`,
    ...overrides,
  };
}

/**
 * Generate test job data
 */
export function generateTestJob(overrides: any = {}) {
  return {
    title: faker.person.jobTitle(),
    company: faker.company.name(),
    location: `${faker.location.city()}, ${faker.location.state()}`,
    description: faker.lorem.paragraphs(2),
    category: faker.helpers.arrayElement(['tech', 'accounting', 'casual', 'healthcare']),
    salary_min: faker.number.int({ min: 40000, max: 80000 }),
    salary_max: faker.number.int({ min: 80000, max: 150000 }),
    employment_type: faker.helpers.arrayElement(['full-time', 'part-time', 'contract', 'internship']),
    external_url: faker.internet.url(),
    status: 'active',
    ...overrides,
  };
}

/**
 * Generate test course data
 */
export function generateTestCourse(overrides: any = {}) {
  const courseTypes = ['free', 'paid'];
  const type = overrides.type || faker.helpers.arrayElement(courseTypes);

  const course: any = {
    title: `${faker.hacker.adjective()} ${faker.hacker.noun()} Course`,
    provider: faker.company.name(),
    description: faker.lorem.paragraph(),
    video_url: `https://youtube.com/watch?v=${faker.string.alphanumeric(11)}`,
    type,
    status: 'published',
    ...overrides,
  };

  // Paid courses require affiliate link
  if (type === 'paid' && !course.affiliate_link) {
    course.affiliate_link = faker.internet.url();
  }

  return course;
}

/**
 * Generate test resume data
 */
export function generateTestResume(overrides: any = {}) {
  return {
    title: `${faker.person.jobTitle()} Resume`,
    content: faker.lorem.paragraphs(5),
    ...overrides,
  };
}

/**
 * Generate test application data
 */
export function generateTestApplication(jobId: string, overrides: any = {}) {
  return {
    job_id: jobId,
    status: faker.helpers.arrayElement(['pending', 'reviewing', 'interview', 'rejected', 'accepted']),
    cover_letter: faker.lorem.paragraphs(3),
    notes: faker.lorem.sentence(),
    ...overrides,
  };
}

/**
 * Sleep utility for async delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Extract token from response
 */
export function extractToken(response: any): string {
  // Supabase format: session.access_token
  if (response.body?.session?.access_token) {
    return response.body.session.access_token;
  }

  // Alternative format: accessToken
  if (response.body?.accessToken) {
    return response.body.accessToken;
  }

  // Debug: log the actual response structure
  console.error('Token extraction failed. Response body:', JSON.stringify(response.body, null, 2));
  console.error('Response status:', response.status);

  throw new Error(`No token found in response. Status: ${response.status}, Body keys: ${Object.keys(response.body || {}).join(', ')}`);
}

/**
 * Create auth headers with token
 */
export function authHeaders(token: string) {
  return {
    'Authorization': `Bearer ${token}`,
  };
}
