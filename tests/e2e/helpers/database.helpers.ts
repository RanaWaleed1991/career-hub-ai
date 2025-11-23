import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load backend environment variables
dotenv.config({ path: path.join(__dirname, '../../../backend/.env') });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in backend/.env');
}

// Create admin client for test data management
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Delete all test users and their associated data
 *
 * SAFE: Only deletes users with emails matching test patterns:
 * - e2e-test-*@mailinator.com
 * - e2e-admin-*@mailinator.com
 */
export async function cleanupTestUsers() {
  try {
    // Get all users with test email pattern
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error('Error listing users:', listError);
      return;
    }

    if (!users) return;

    // Filter test users only (SAFETY CHECK)
    const testUsers = users.filter(user =>
      user.email?.includes('e2e-test-') && user.email?.includes('@mailinator.com') ||
      user.email?.includes('e2e-admin-') && user.email?.includes('@mailinator.com')
    );

    // Delete each test user (cascades to resumes, applications, subscriptions via FK)
    for (const user of testUsers) {
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
      if (deleteError) {
        console.error(`Error deleting test user ${user.email}:`, deleteError);
      }
    }

    console.log(`✅ Cleaned up ${testUsers.length} test user(s)`);
  } catch (error) {
    console.error('Error in cleanupTestUsers:', error);
  }
}

/**
 * Delete all test jobs
 *
 * SAFE: Only deletes jobs with source='e2e_test'
 */
export async function cleanupTestJobs() {
  try {
    const { error } = await supabaseAdmin
      .from('jobs')
      .delete()
      .eq('source', 'e2e_test');

    if (error) {
      console.error('Error cleaning up test jobs:', error);
    }
  } catch (error) {
    console.error('Error in cleanupTestJobs:', error);
  }
}

/**
 * Delete all test courses
 *
 * SAFE: Only deletes courses with provider containing 'E2E Test'
 */
export async function cleanupTestCourses() {
  try {
    const { error } = await supabaseAdmin
      .from('courses')
      .delete()
      .ilike('provider', '%E2E Test%');

    if (error) {
      console.error('Error cleaning up test courses:', error);
    }
  } catch (error) {
    console.error('Error in cleanupTestCourses:', error);
  }
}

/**
 * Complete cleanup - removes ALL test data
 * Called after each test to keep database clean
 */
export async function cleanupAllTestData() {
  await cleanupTestJobs();
  await cleanupTestCourses();
  await cleanupTestUsers(); // Must be last (cascades to user data)
}

/**
 * Create a test admin user
 * Returns user ID and credentials for login
 */
export async function createTestAdmin() {
  const timestamp = Date.now();
  const email = `e2e-admin-${timestamp}@mailinator.com`;
  const password = 'TestAdmin123!@#';

  try {
    // Create admin user
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: 'E2E Test Admin',
        role: 'admin'
      },
      app_metadata: {
        role: 'admin' // CRITICAL for RLS policies
      }
    });

    if (error) throw error;

    console.log(`✅ Created test admin: ${email}`);

    return {
      id: data.user!.id,
      email,
      password
    };
  } catch (error) {
    console.error('Error creating test admin:', error);
    throw error;
  }
}

/**
 * Create a regular test user
 * Returns user ID and credentials for login
 */
export async function createTestUser(fullName: string = 'E2E Test User') {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  const email = `e2e-test-${timestamp}-${random}@mailinator.com`;
  const password = 'TestUser123!@#';

  try {
    // Create regular user
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: fullName
      }
    });

    if (error) throw error;

    console.log(`✅ Created test user: ${email}`);

    return {
      id: data.user!.id,
      email,
      password,
      fullName
    };
  } catch (error) {
    console.error('Error creating test user:', error);
    throw error;
  }
}

/**
 * Get user's access token for API calls
 */
export async function getUserToken(email: string, password: string): Promise<string> {
  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  if (!data.session) throw new Error('No session created');

  return data.session.access_token;
}
