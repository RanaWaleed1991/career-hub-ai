# Database Setup Instructions

## Overview
This application uses Supabase (PostgreSQL) for data persistence. The database schema includes tables for resumes, resume versions, applications, and subscriptions.

## Setup Steps

### 1. Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project or use an existing one
3. Note your project URL and anon key

### 2. Apply Database Schema
1. In your Supabase dashboard, navigate to the **SQL Editor**
2. Open the `database_schema.sql` file from this project
3. Copy and paste the entire contents into the SQL Editor
4. Click **Run** to execute the schema

This will create:
- `resumes` table - Store user resume data
- `resume_versions` table - Store different versions of resumes
- `applications` table - Job application tracking
- `subscriptions` table - User subscription and trial data
- Row Level Security (RLS) policies for data protection
- Triggers for automatic timestamp updates
- Function to auto-create subscriptions for new users

### 3. Refresh Schema Cache
If you encounter errors like `PGRST204` (schema cache errors), you need to refresh Supabase's schema cache:

**Option A: Using Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Scroll down and click **Reload schema cache**

**Option B: Using SQL**
Run this command in the SQL Editor:
```sql
NOTIFY pgrst, 'reload schema';
```

### 4. Verify Tables
Run this query in the SQL Editor to verify all tables are created:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

You should see:
- applications
- resumes
- resume_versions
- subscriptions

### 5. Configure Environment Variables
Make sure your backend `.env` file has the correct Supabase credentials:
```
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
```

## Troubleshooting

### Error: "Could not find the 'version_name' column"
This error (PGRST204) means Supabase's schema cache is out of sync. Solutions:
1. Reload the schema cache (see step 3 above)
2. Verify the table was created correctly by running:
   ```sql
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'resume_versions';
   ```
3. If the table doesn't exist or is missing columns, re-run the `database_schema.sql` file

### Error: "Database is not configured"
This means the backend cannot connect to Supabase:
1. Verify `.env` file exists in the `backend` directory
2. Check that `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set correctly
3. Restart the backend server after updating `.env`

### Row Level Security (RLS) Issues
If users can't access their data:
1. Verify you're logged in (authenticated)
2. Check that RLS policies are enabled on all tables
3. Verify the user ID matches between `auth.users` and your data

## Testing

After setup, test each feature:
1. **Resume Versions**: Save a resume version in "My Resume Version" section
2. **Application Tracker**: Add a new job application
3. **Trial Status**: Check that usage counts are displayed correctly
4. **Supabase Dashboard**: Verify data appears in the tables

## Data Migration

If you have existing data in localStorage, it will NOT be automatically migrated to the database. Users will need to:
1. Re-create their resumes in the database
2. Re-add their job applications

This is intentional to ensure data integrity with the new schema.
