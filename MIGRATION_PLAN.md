# Database Migration Plan - Production Supabase

## Overview

This document outlines the plan to migrate the Career Hub AI database schema to a new production Supabase project.

**Migration Type**: Schema only (no data migration)
**Source**: 13 SQL migration files consolidated into one script
**Target**: New production Supabase project
**Date**: 2025-11-19

---

## 📋 Pre-Migration Checklist

- [ ] Review consolidated migration script: `consolidated_production_migration.sql`
- [ ] Obtain production Supabase project URL
- [ ] Obtain production Supabase service role key (for auth.users trigger)
- [ ] Verify new Supabase project is empty/ready for migration
- [ ] Backup any existing data (if applicable)

---

## 📊 Schema Analysis

### Tables to Create (7 total):

| Table | Purpose | Key Features |
|-------|---------|--------------|
| **resumes** | User resume storage | JSONB data, versioning support |
| **resume_versions** | Resume version history | Linked to resumes, version numbers |
| **applications** | Job application tracking | Status tracking, dates, notes |
| **subscriptions** | User subscription management | Stripe integration, usage limits |
| **jobs** | Admin-managed job listings | External API integration (Adzuna) |
| **courses** | Course catalog | Affiliate links, enrollment tracking |
| **course_enrollments** | User course enrollments | Progress tracking, completion dates |

### Functions (2):

1. **update_updated_at_column()** - Auto-updates timestamps
2. **create_user_subscription()** - Creates free subscription on user signup

### Triggers (6):

- `update_resumes_updated_at` - Auto-update timestamps on resumes
- `update_applications_updated_at` - Auto-update timestamps on applications
- `update_subscriptions_updated_at` - Auto-update timestamps on subscriptions
- `update_jobs_updated_at` - Auto-update timestamps on jobs
- `update_courses_updated_at` - Auto-update timestamps on courses
- `on_auth_user_created` - Auto-create subscription when user signs up

### RLS Policies (24 total):

- **Resumes**: 4 policies (view, create, update, delete own)
- **Resume Versions**: 3 policies (view, create, delete own)
- **Applications**: 4 policies (view, create, update, delete own)
- **Subscriptions**: 2 policies (view, update own)
- **Jobs**: 4 policies (public read, admin write)
- **Courses**: 4 policies (public read, admin write)
- **Course Enrollments**: 3 policies (view, create, update own)

---

## 🔧 Migration File Consolidation

### Source Files Analyzed:

1. ✅ `database_schema.sql` - Base schema (resumes, versions, applications, subscriptions)
2. ✅ `backend/migrations/005_create_jobs_and_courses_tables.sql` - Jobs and courses
3. ✅ `backend/migrations/006_add_external_job_fields.sql` - Adzuna integration
4. ✅ `backend/migrations/007_enhance_course_schema.sql` - Enhanced courses + enrollments
5. ✅ `stripe_integration_migration.sql` - Stripe fields for subscriptions
6. ✅ `update_plan_constraint.sql` - Plan constraint update (free/weekly/monthly)

### Redundant Fix Files (Issues Already Resolved):

7. ⚠️ `fix_all_applications_columns.sql` - role/position, date_applied/applied_date
8. ⚠️ `fix_applications_table.sql` - applied_date column
9. ⚠️ `fix_applications_table_comprehensive.sql` - Full table creation
10. ⚠️ `fix_date_applied_column.sql` - Date column mismatch
11. ⚠️ `fix_role_column_constraint.sql` - Role column constraint

**Resolution**: Consolidated script creates applications table correctly from the start with:
- `position` column (NOT `role`)
- `applied_date` column (NOT `date_applied`)

### Utility Files (Not Needed for Fresh Migration):

12. ℹ️ `verify_and_fix_schema.sql` - Schema verification (dev/debug tool)
13. ℹ️ `reset_free_credits.sql` - Usage reset script (not part of schema)

---

## 🚨 Schema Corrections Made

### 1. Applications Table Column Names

**Problem**: Multiple migrations tried to fix column name mismatches

**Solution**: Created table correctly from the start:
- ✅ Uses `position` (not `role`)
- ✅ Uses `applied_date` (not `date_applied`)

### 2. Subscriptions Plan Values

**Evolution**:
- Old: `('free', 'basic', 'professional')`
- **New**: `('free', 'weekly', 'monthly')`

**Solution**: Updated constraint to match current pricing model

### 3. Courses Table Rename

**Change**: `link` column renamed to `video_url` for clarity

**Solution**: Created table with correct column name from the start

---

## 📝 Tables NOT Included

The task description mentioned these tables, but they don't exist in any migration files:

- ❌ `revoked_tokens` (JWT blacklist)
- ❌ `password_reset_tokens` (password resets)
- ❌ `data_access_log` (GDPR compliance)

**Action Required**: If these tables are needed, please provide their schema definitions.

---

## 🎯 Migration Execution Plan

### Step 1: Pre-Migration

1. Open your **new production Supabase project**
2. Navigate to **SQL Editor**
3. Verify project is empty (or backup existing data)

### Step 2: Execute Migration

1. Open `consolidated_production_migration.sql`
2. Copy the entire script
3. Paste into Supabase SQL Editor
4. Click **Run** button

### Step 3: Verification

After running the script, verify:

```sql
-- Check all tables were created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Expected: applications, course_enrollments, courses, jobs, resumes, resume_versions, subscriptions

-- Check all functions exist
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Expected: create_user_subscription, update_updated_at_column

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Expected: All tables should have rowsecurity = true
```

### Step 4: Test Auto-Subscription Creation

Create a test user to verify the trigger works:

1. Go to **Authentication** > **Users** in Supabase Dashboard
2. Create a test user
3. Run this query to verify subscription was auto-created:

```sql
SELECT * FROM public.subscriptions
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test@example.com');
```

Expected result: One row with plan='free', status='active', all usage counters at 0

### Step 5: Update Backend Configuration

Update your backend `.env` file with new Supabase credentials:

```env
SUPABASE_URL=https://your-new-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-new-service-role-key
SUPABASE_ANON_KEY=your-new-anon-key
```

---

## ⚠️ Important Notes

### Auto-Subscription Trigger

The `on_auth_user_created` trigger runs on `auth.users` table (managed by Supabase Auth). This requires the function to be `SECURITY DEFINER` to access the auth schema.

### Stripe Fields

All Stripe fields in the subscriptions table allow NULL values. They will be populated when users upgrade to paid plans.

### External Jobs

The jobs table supports both manual entries (admin-created) and external jobs (Adzuna API). The `source` field and unique index prevent duplicate external jobs.

### Course Enrollments

The `(user_id, course_id)` unique constraint prevents users from enrolling in the same course twice.

---

## 🔄 Rollback Plan

If migration fails or issues are discovered:

1. **Option A**: Drop all tables and re-run
   ```sql
   DROP TABLE IF EXISTS public.course_enrollments CASCADE;
   DROP TABLE IF EXISTS public.courses CASCADE;
   DROP TABLE IF EXISTS public.jobs CASCADE;
   DROP TABLE IF EXISTS public.applications CASCADE;
   DROP TABLE IF EXISTS public.resume_versions CASCADE;
   DROP TABLE IF EXISTS public.resumes CASCADE;
   DROP TABLE IF EXISTS public.subscriptions CASCADE;
   DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
   DROP FUNCTION IF EXISTS create_user_subscription CASCADE;
   ```

2. **Option B**: Use Supabase project reset (creates entirely new project)

---

## 📞 Next Steps

1. **Ready to migrate?** Provide your production Supabase credentials:
   - Project URL
   - Service role key (needed for migration verification)

2. **Need changes?** Let me know if:
   - You need the missing tables (revoked_tokens, password_reset_tokens, data_access_log)
   - Any schema modifications are required
   - You want to review the consolidated script first

3. **Have existing data?** If you need to migrate data from an old database, we'll need to create data migration scripts (not included in current scope).

---

## ✅ Migration Completion Checklist

After migration:

- [ ] All 7 tables created successfully
- [ ] All 2 functions created
- [ ] All 6 triggers created
- [ ] RLS enabled on all tables
- [ ] All 24 RLS policies created
- [ ] All indexes created
- [ ] Auto-subscription trigger tested and working
- [ ] Backend `.env` updated with new credentials
- [ ] Application connects to new database successfully
- [ ] Test user registration creates subscription automatically
- [ ] Test CRUD operations on each table work correctly

---

**Status**: Ready for production migration ✅
**Consolidated Script**: `consolidated_production_migration.sql`
**Waiting for**: Production Supabase credentials to execute migration
