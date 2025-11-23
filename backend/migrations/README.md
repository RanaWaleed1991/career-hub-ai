# Database Migrations

This folder contains SQL migration scripts for database schema and data updates.

## How to Run Migrations

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Open the migration file and copy its contents
4. Paste into the SQL Editor
5. Run the query

### Option 2: psql Command Line
```bash
psql "postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]" -f migrations/filename.sql
```

## Available Migrations

### standardize_course_categories.sql
- **Purpose**: Updates all course categories to use standard names
- **Categories**: Technology, Accounting, Resume & Interview, Personal Development
- **Safe to run**: Yes (idempotent - can be run multiple times)
- **Recommended**: Run this migration if you have existing courses with inconsistent category names

## Migration Best Practices

1. **Always backup** your database before running migrations
2. **Test in development** before running in production
3. **Review the migration** to understand what changes it will make
4. **Check results** by running the verification queries included in each migration
