# E2E Testing Setup Checklist

## ✅ Quick Pre-Flight Check

Before running E2E tests, verify these items:

### 1. Environment Variables (backend/.env)

```bash
# Required variables:
✅ SUPABASE_URL=https://your-project.supabase.co
✅ SUPABASE_SERVICE_KEY=your_service_key_here
✅ PORT=3001
✅ FRONTEND_URL=http://localhost:5173

# Optional (can be mock/empty for tests):
⚠️  GEMINI_API_KEY=mock_key
⚠️  ADZUNA_APP_ID=mock_id
⚠️  ADZUNA_API_KEY=mock_key

# For payment tests (use TEST mode):
⚠️  STRIPE_SECRET_KEY=sk_test_...
⚠️  STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Check:** Open `backend/.env` and verify your Supabase credentials are set.

---

### 2. Dependencies Installed

```bash
# Root (Playwright)
npm install

# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

**Check:** Run `npm list @playwright/test` to verify Playwright is installed.

---

### 3. Database Schema

Your Supabase database should have these tables:
- ✅ `auth.users` (Supabase built-in)
- ✅ `resumes`
- ✅ `resume_versions`
- ✅ `applications`
- ✅ `subscriptions`
- ✅ `jobs`
- ✅ `courses`

**Check:** Open Supabase dashboard → Table Editor → Verify tables exist.

---

### 4. RLS Policies

Ensure Row Level Security policies are configured for:
- ✅ `jobs` table (admin can insert/update/delete, public can read)
- ✅ `courses` table (admin can insert/update/delete, public can read)

**Check:** Supabase dashboard → Table Editor → Click table → Check RLS toggle is ON.

---

### 5. Servers Can Start

**Frontend:**
```bash
cd frontend
npm run dev
# Should start on http://localhost:5173
```

**Backend:**
```bash
cd backend
npm run dev
# Should start on http://localhost:3001
```

**Check:** Open browser → http://localhost:5173 → Should see Career Hub AI login page.

---

## 🚀 Ready to Test!

If all checks pass, run:

```bash
# From project root
npm run test:e2e
```

**Expected Output:**
```
Running 38 tests using 1 worker

  ✓ 01-auth.e2e.spec.ts:15:3 › should register a new user successfully (5s)
  ✓ 01-auth.e2e.spec.ts:42:3 › should show validation error for password mismatch (2s)
  ✓ 01-auth.e2e.spec.ts:65:3 › should show validation error for weak password (2s)
  ...

  38 passed (2.5m)
```

---

## 🐛 Common Issues

### Issue: "SUPABASE_URL is not defined"

**Solution:**
1. Check `backend/.env` file exists
2. Verify SUPABASE_URL is set
3. No quotes needed: `SUPABASE_URL=https://your-project.supabase.co`

---

### Issue: "Target page, context or browser has been closed"

**Solution:**
1. Frontend/backend not running
2. Run: `npm run dev` (starts both servers)
3. Or manually start both in separate terminals

---

### Issue: "Timeout 30000ms exceeded"

**Solution:**
1. Servers are slow to start
2. Increase timeout in `playwright.config.ts`:
   ```typescript
   timeout: 60 * 1000, // 60 seconds
   ```
3. Or run tests after servers are already running

---

### Issue: "Cannot find module '@supabase/supabase-js'"

**Solution:**
```bash
cd backend && npm install @supabase/supabase-js
```

---

### Issue: "Database error: relation 'jobs' does not exist"

**Solution:**
1. Run `database_schema.sql` in Supabase SQL Editor
2. Verify tables are created
3. Check RLS policies are enabled

---

## 📊 Test Results

After tests complete:

**View HTML Report:**
```bash
npm run test:e2e:report
```

**Check Screenshots (if tests failed):**
```
test-results/
  ├── screenshots/
  │   └── failed-test-1.png
  ├── videos/
  │   └── failed-test-1.webm
  └── html-report/
      └── index.html
```

---

## 🎯 Next Steps After First Run

1. **All tests pass?** → Add to CI/CD pipeline
2. **Some tests fail?** → Check screenshots in `test-results/`
3. **Need debugging?** → Run `npm run test:e2e:ui`

---

## 🔐 Security Notes

**Safe for Testing:**
- ✅ Uses same Supabase project as development
- ✅ Test data is clearly marked (e2e-test-* emails)
- ✅ Automatic cleanup after each test
- ✅ Uses mailinator.com (no real emails sent)
- ✅ Mocks external APIs (Gemini, Adzuna)

**Supabase Won't Ban You:**
- Tests run sequentially (not 1000 req/sec)
- ~100 requests total across all tests
- Spread over 5-10 minutes
- Normal usage pattern

---

## ✅ Final Checklist

Before running tests, confirm:

- [ ] `backend/.env` has SUPABASE_URL and SUPABASE_SERVICE_KEY
- [ ] `npm install` completed successfully
- [ ] Supabase tables exist (resumes, jobs, courses, etc.)
- [ ] RLS policies enabled on jobs and courses tables
- [ ] Frontend starts: `cd frontend && npm run dev`
- [ ] Backend starts: `cd backend && npm run dev`
- [ ] Can access http://localhost:5173 in browser

**All checked?** Run:
```bash
npm run test:e2e
```

Good luck! 🚀
