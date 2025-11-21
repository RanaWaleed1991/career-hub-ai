# Adding 10 Free Courses to Career Hub AI

## Overview
This guide explains how to add 10 curated YouTube courses to your Career Hub AI database.

## Course Categories
- **Resume Writing** (2 courses)
- **Interview Skills** (2 courses)
- **LinkedIn & Networking** (2 courses)
- **Job Search Strategies** (2 courses)
- **Career Development** (2 courses)

## Method 1: Supabase SQL Editor (Recommended)

### Steps:
1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your Career Hub AI project
3. Click on "SQL Editor" in the left sidebar
4. Click "New query"
5. Copy the entire contents of `add_free_courses.sql`
6. Paste into the SQL Editor
7. Click "Run" (or press Ctrl/Cmd + Enter)
8. Verify the courses were added by checking the output table

### Expected Result:
You should see 10 courses listed with their titles, categories, levels, durations, and enrollment counts.

## Method 2: Using psql (Advanced)

If you prefer command line:

```bash
# Get your database connection string from Supabase
# Settings > Database > Connection string (Direct connection)

psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST].supabase.co:5432/postgres" -f add_free_courses.sql
```

## Verification

After running the script, verify the courses are visible:

1. **Via Supabase Dashboard:**
   - Go to Table Editor
   - Select "courses" table
   - You should see 10 new courses

2. **Via Application:**
   - Log in to Career Hub AI
   - Navigate to Courses page
   - All 10 courses should be visible
   - Featured courses should appear first

## Featured Courses

The following courses are marked as featured and will appear prominently:
- How to Write a Professional Resume in 2024
- Resume Writing Tips (Jeff Su)
- Top 10 Job Interview Questions & Answers
- How to Succeed in Your First Interview (Harvard Business Review)
- How to Use LinkedIn to Get a Job
- How to Find a Job Fast in 2024
- Career Development (Stanford GSB)

## Troubleshooting

**Error: "relation public.courses does not exist"**
- Run the consolidated production migration first
- Make sure you're connected to the correct database

**Error: "permission denied"**
- Make sure you're using a privileged database user (postgres role)
- Check your connection string includes the service_role key

**Courses not appearing in app:**
- Verify status is 'published' (not 'draft')
- Check that the frontend is fetching from the correct API endpoint
- Clear browser cache and refresh

## Notes

- All courses are set to type 'free'
- All courses are set to status 'published'
- Enrollment counts are initial estimates (will be updated as users enroll)
- Thumbnail URLs point to YouTube's maxresdefault images
- Video URLs are direct YouTube links

## Next Steps

After adding the courses:
1. Test each course link to ensure videos are accessible
2. Verify thumbnails load correctly
3. Check that enrollment tracking works
4. Consider adding more courses in the future based on user feedback
