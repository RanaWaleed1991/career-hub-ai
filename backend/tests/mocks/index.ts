/**
 * Test Mocks and Fixtures
 *
 * Common mock data and helper functions for tests
 */

// Mock user data
export const mockUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'test@example.com',
  role: 'user' as const,
  created_at: '2024-01-01T00:00:00Z',
  is_active: true,
};

// Mock admin user
export const mockAdmin = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  email: 'admin@example.com',
  role: 'admin' as const,
  created_at: '2024-01-01T00:00:00Z',
  is_active: true,
};

// Mock resume data
export const mockResume = {
  id: '650e8400-e29b-41d4-a716-446655440000',
  user_id: mockUser.id,
  data: {
    personalInfo: {
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      location: 'Sydney, Australia',
    },
    summary: 'Experienced software developer',
    experience: [],
    education: [],
    skills: ['JavaScript', 'TypeScript', 'React'],
  },
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

// Mock job data
export const mockJob = {
  id: '750e8400-e29b-41d4-a716-446655440000',
  title: 'Software Developer',
  company: 'Tech Corp',
  location: 'Sydney',
  description: '<p>We are looking for a talented developer</p>',
  category: 'tech' as const,
  status: 'active' as const,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

// Mock course data
export const mockCourse = {
  id: '850e8400-e29b-41d4-a716-446655440000',
  title: 'Learn TypeScript',
  provider: 'Udemy',
  description: '<p>Comprehensive TypeScript course</p>',
  video_url: 'https://example.com/course',
  type: 'free' as const,
  level: 'beginner' as const,
  status: 'published' as const,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

// Mock application data
export const mockApplication = {
  id: '950e8400-e29b-41d4-a716-446655440000',
  user_id: mockUser.id,
  job_id: mockJob.id,
  company: 'Tech Corp',
  position: 'Software Developer',
  status: 'applied' as const,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

// Mock subscription data
export const mockSubscription = {
  id: 'a50e8400-e29b-41d4-a716-446655440000',
  user_id: mockUser.id,
  plan: 'free' as const,
  status: 'active' as const,
  ai_enhancements_used: 0,
  downloads_used: 0,
  cover_letters_generated: 0,
  resume_analyses_done: 0,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

// Mock Express Request
export const mockRequest = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  user: null,
  ip: '127.0.0.1',
  ...overrides,
});

// Mock Express Response
export const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  res.redirect = jest.fn().mockReturnValue(res);
  return res;
};

// Mock Next function
export const mockNext = jest.fn();

// Helper to reset all mocks
export const resetAllMocks = () => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
};
