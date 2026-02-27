# CLAUDE.md — Career Hub AI: Agent Operational Guide

> **This is the single source of truth for all AI agents working on this project.**
> A new agent should be able to start coding within 5 minutes of reading this.

---

## PROJECT QUICK START

**What it is:** A production SaaS platform for AI-powered career development — resume building, AI analysis/tailoring, cover letter generation, job search, application tracking, and subscription management.

**Production URL:** https://www.careerhubai.com.au
**Status:** LIVE — marketing & user acquisition phase

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite + TailwindCSS + React Router v7 |
| Backend | Node.js + Express + TypeScript |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| AI | Google Gemini API (`gemini-2.5-flash` / `gemini-2.5-pro`) |
| Payments | Stripe (live mode) |
| Email | SendGrid |
| Job Data | Adzuna API |
| Hosting | Vercel (both frontend + backend as serverless functions) |
| Monitoring | Sentry + Vercel Analytics + Google Analytics 4 (G-JB8M2D2SLF) |

### How to Run Locally

```bash
# 1. Install all dependencies (from project root)
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..

# 2. Configure environment variables
cp backend/.env.example backend/.env        # Fill in values
cp frontend/.env.example frontend/.env.local # Fill in values

# 3. Start backend (port 3001)
cd backend && npm run dev

# 4. Start frontend (port 5173) — in a new terminal
cd frontend && npm run dev

# 5. Run tests
npm run test           # All backend tests (unit + integration)
npm run test:e2e       # E2E tests (requires both servers running)
```

### Environment Variables Needed

**`backend/.env`**
```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173

# Required APIs
GEMINI_API_KEY=your_gemini_api_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_role_key_here

# Stripe (use test keys for dev)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# External services
ADZUNA_APP_ID=...
ADZUNA_APP_KEY=...
SENDGRID_API_KEY=SG....
EMAIL_FROM=careerhubaiaus@gmail.com
EMAIL_FROM_NAME=Career Hub AI
```

**`frontend/.env.local`**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
# Note: No VITE_API_URL needed — proxied via Vite or Vercel rewrites
```

---

## CODEBASE STRUCTURE

```
career-hub-ai/
├── frontend/                      ← React SPA
│   ├── App.tsx                    ← Route definitions (React Router v7)
│   ├── index.tsx                  ← Entry point (Sentry init)
│   ├── types.ts                   ← ALL TypeScript interfaces
│   ├── components/                ← 30+ page/feature components
│   ├── templates/                 ← 6 resume templates
│   ├── services/                  ← API client functions
│   └── src/
│       ├── contexts/AuthContext.tsx
│       ├── config/supabase.ts     ← Supabase client (anon key)
│       ├── config/metaTags.ts     ← SEO meta tag config
│       └── components/
│           ├── SEO.tsx
│           ├── routes/ProtectedRoute.tsx
│           ├── routes/AdminRoute.tsx
│           └── payments/
│
├── backend/
│   └── src/
│       ├── server.ts              ← Entry point
│       ├── app.ts                 ← Express app + middleware mounting
│       ├── routes/                ← 12 route files (see API Endpoints)
│       ├── middleware/            ← auth, rateLimiting, cors, cache, security
│       ├── services/              ← database.ts, subscription.ts, emailService.ts, adzunaService.ts
│       ├── config/                ← env.ts, supabase.ts (service key), stripe.ts
│       ├── validators/schemas.ts  ← Joi validation schemas
│       └── utils/                 ← loginAttempts.ts, sanitization.ts
│
├── tests/e2e/                     ← Playwright E2E tests
├── database_schema.sql            ← Full schema reference
├── consolidated_production_migration.sql ← Run this on a new Supabase project
└── backend/migrations/            ← 9 incremental SQL migration files
```

### Frontend: Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `App.tsx` | `frontend/App.tsx` | All routes, lazy loading, protected/admin routes |
| `AuthContext` | `frontend/src/contexts/AuthContext.tsx` | Global auth state (user, session, loading) |
| `ResumeBuilder` | `frontend/components/ResumeBuilder.tsx` | Core resume editor with template switching |
| `ResumeAnalyserPage` | `frontend/components/ResumeAnalyserPage.tsx` | AI ATS scoring |
| `CoverLetterBuilder` | `frontend/components/CoverLetterBuilder.tsx` | AI cover letter generation |
| `Dashboard` | `frontend/components/Dashboard.tsx` | User home, usage stats |
| `AdminPage` | `frontend/components/AdminPage.tsx` | Admin hub with tabs (jobs, courses, blogs) |
| `BlogManagement` | `frontend/components/BlogManagement.tsx` | Admin CRUD for blogs |
| `BlogsPage` | `frontend/components/BlogsPage.tsx` | Public blog listing with search |
| `BlogPostPage` | `frontend/components/BlogPostPage.tsx` | Single blog with DOMPurify |
| `PricingPage` | `frontend/src/components/payments/PricingPage.tsx` | Subscription plans |
| `SubscriptionManagement` | `frontend/src/components/payments/SubscriptionManagement.tsx` | Manage existing plan |
| `LandingPage` | `frontend/components/LandingPage.tsx` | Public homepage |
| `Header` | `frontend/components/Header.tsx` | Navigation (useNavigate) |
| `TailorResumeModal` | `frontend/components/TailorResumeModal.tsx` | Job description tailoring |
| `WelcomeModal` | `frontend/components/WelcomeModal.tsx` | First-login greeting |

### Frontend: Resume Templates

All in `frontend/templates/`:
- `ClassicTemplate.tsx`, `ModernTemplate.tsx`, `AustralianTemplate.tsx`
- `PictureTemplate.tsx`, `ATSTemplate.tsx`, `MinimalTemplate.tsx`

### Frontend: Services (API clients)

| Service | File | Key Functions |
|---------|------|---------------|
| Auth | `services/userService.ts` | `signup`, `login`, `logout`, `getCurrentUser`, `signInWithOAuth` |
| Resume CRUD | `services/resumeService.ts` | `saveResume`, `getLatestResume`, `getAllResumes`, `deleteResume` |
| AI Features | `services/geminiService.ts` | `enhanceTextWithAI`, `generateCoverLetter`, `analyzeResume`, `tailorResumeForJob` |
| Subscriptions | `services/premiumService.ts` | `getSubscription`, `canDownloadResume`, `canGenerateCoverLetter`, `canAnalyzeResume`, `canSaveVersion` |
| PDF | `services/pdfService.ts` | `exportResumeToPDF`, `extractTextFromPDF` |
| Content | `services/contentService.ts` | `getJobsByCategory`, `getCourses`, `getBlogs`, `getBlogBySlug` |
| Applications | `services/applicationService.ts` | `createApplication`, `getApplications`, `updateApplicationStatus` |
| Versions | `services/versionHistoryService.ts` | `saveVersion`, `canSaveVersion`, `restoreVersion` |

### Backend: API Endpoints

All routes mounted in `backend/src/app.ts`. Base: `/api/`

**Auth** (`routes/auth.ts`) — rate: 10/15min
```
POST /api/auth/signup          → Register user + welcome email
POST /api/auth/login           → Login with brute force protection
POST /api/auth/logout          ← Requires auth
GET  /api/auth/me              ← Requires auth
POST /api/auth/google          → Google OAuth
POST /api/auth/password-reset/request → Request reset email
POST /api/auth/password-change ← Requires auth
POST /api/auth/refresh         → Refresh JWT
```

**Resumes** (`routes/resumes.ts`) ← Requires auth
```
POST   /api/resumes            → Create resume
GET    /api/resumes            → Get all user resumes
GET    /api/resumes/:id        → Get one resume
PUT    /api/resumes/:id        → Update resume
PUT    /api/resumes/:id/activate → Set active
DELETE /api/resumes/:id        → Delete resume
```

**AI Features** (`routes/gemini.ts`) — rate: 500/hour ← Requires auth
```
POST /api/gemini/enhance-summary      → Enhance text (gemini-2.5-flash)
POST /api/gemini/analyze-resume       → ATS score + feedback (gemini-2.5-pro)
POST /api/gemini/generate-cover-letter → Cover letter (gemini-2.5-pro)
POST /api/gemini/tailor-resume        → Tailor to job desc (gemini-2.5-flash)
```

**Payments** (`routes/payments.ts`) — rate: 10/hour ← Requires auth
```
GET  /api/payments/config                    → Stripe public key + pricing
POST /api/payments/create-checkout-session  → Start Stripe checkout
POST /api/payments/create-portal-session    → Stripe customer portal
GET  /api/payments/subscription-status      → Current plan status
POST /api/payments/cancel-subscription      → Cancel at period end
POST /api/payments/reactivate-subscription  → Reactivate canceled
```

**Subscriptions** (`routes/subscriptions.ts`) ← Requires auth
```
GET /api/subscriptions/status    → Full subscription object
POST /api/subscriptions/reset    → (admin) Reset usage counters
```

**Other Routes:**
```
GET    /api/jobs                      → Public job listings (cached 5min)
GET    /api/jobs/category/:category   → Filter: tech | accounting | casual
POST   /api/jobs/admin                ← Admin: create job
PUT    /api/jobs/admin/:id            ← Admin: update job
DELETE /api/jobs/admin/:id            ← Admin: delete job
POST   /api/jobs/admin/sync           ← Admin: sync from Adzuna

GET    /api/courses                   → Public courses (cached 10min)
GET    /api/blogs                     → Public blogs (paginated)
GET    /api/blogs/:slug               → Single blog + increment views
POST   /api/blogs/admin               ← Admin: create blog
PUT    /api/blogs/admin/:id           ← Admin: update blog

POST   /api/applications              ← Auth: log application
GET    /api/applications              ← Auth: get applications
PUT    /api/applications/:id          ← Auth: update status
DELETE /api/applications/:id          ← Auth: delete application

POST   /api/versions                  ← Auth: save resume version
GET    /api/versions/resume/:id       ← Auth: get versions for resume
POST   /api/versions/:id/restore      ← Auth: restore version

GET    /api/user/export-data          ← Auth: GDPR data export
DELETE /api/user/account              ← Auth: delete account + all data
POST   /api/webhooks/stripe           → Stripe webhook (signature verified)
GET    /health                        → Server health check
```

### Database Schema (Supabase PostgreSQL)

Run `consolidated_production_migration.sql` on a fresh Supabase project to set up everything.

| Table | Key Columns | Notes |
|-------|-------------|-------|
| `resumes` | `id, user_id, data (JSONB), is_active` | JSONB stores full resume object |
| `resume_versions` | `id, user_id, resume_id, data (JSONB), version_name` | Free: max 3 |
| `applications` | `id, user_id, company, position, status, applied_date` | **`position`** not `role`; **`applied_date`** not `date_applied` |
| `subscriptions` | `id, user_id, plan, status, downloads_used, resume_analyses_done, cover_letters_generated, ai_tailoring_used, versions_saved` | Auto-created on signup via trigger |
| `jobs` | `id, title, company, location, description, category, status` | `status`: published/draft |
| `courses` | `id, title, provider, type, affiliate_link, video_url, status` | `type`: free/paid |
| `course_enrollments` | `user_id, course_id, enrolled_at` | |
| `blogs` | `id, title, slug, content, status, meta_title, meta_description, view_count` | `status`: published/draft |

**Critical column names — mismatches cause silent bugs:**
- `applications.position` (NOT `role`)
- `applications.applied_date` (NOT `date_applied`)
- `courses.video_url` (NOT `link`)
- `subscriptions.ai_tailoring_used` (NOT `tailoring_used`)
- `subscriptions.plan` values: `'free'` | `'weekly'` | `'monthly'`

### Configuration Files

| File | Purpose |
|------|---------|
| `frontend/vite.config.ts` | Vite build, proxy config |
| `frontend/vercel.json` | Vercel SPA rewrites (all routes → index.html) |
| `backend/vercel.json` | Vercel serverless function config |
| `backend/src/config/env.ts` | Env validation — throws on startup if vars missing |
| `backend/src/validators/schemas.ts` | Joi schemas for all API payloads |
| `playwright.config.ts` | E2E test config (servers auto-start) |

---

## CURRENT DEVELOPMENT STATUS

### Features Completed and Working ✅

- Resume builder with 6 templates (Classic, Modern, Australian, Picture, ATS, Minimal)
- AI content enhancement (unlimited for all users)
- AI resume tailoring to job descriptions (unlimited for all users)
- AI resume analysis with ATS scoring (3 free, unlimited paid)
- AI cover letter generation (3 free, unlimited paid)
- PDF export/import
- Resume version history (3 free saves, unlimited paid)
- Job listings (manual admin entry + Adzuna sync ready)
- Course catalog with enrollment tracking
- Blog system with SEO, full-text search, draft/published workflow
- Stripe payments — weekly ($9.99) and monthly ($24.99) plans — **LIVE MODE**
- Google OAuth only (Facebook removed December 2025)
- GDPR: data export + account deletion
- SEO: meta tags, Open Graph, sitemap.xml, robots.txt, Google Search Console
- Google Analytics 4 (G-JB8M2D2SLF)
- E2E tests: 38 tests (auth, jobs, courses, admin)
- Unit + integration tests: 274 total automated tests

### Known Issues / Bugs 🔴

**Password Reset (DEFERRED — highest priority when user base grows)**
- Emails send successfully but links trigger `#error=access_denied&error_code=otp_expired`
- Workaround: Admin manually resets via Supabase Dashboard → Users → Reset Password
- Root cause: Token invalidated between generation and use; possibly Supabase free tier email config
- Fix requires: Configure Supabase to use SendGrid SMTP OR upgrade to Supabase Pro ($25/mo)

**SendGrid Email Deliverability**
- Password reset emails sometimes go to spam
- Fix: Configure SPF/DKIM/DMARC domain authentication in SendGrid dashboard

### Immediate Next Priorities

1. Fix password reset flow (when user volume justifies it)
2. Set up Google Analytics event tracking (GA4 installed, events not configured)
3. Add Stripe webhook monitoring/retry logic for missed events
4. E2E tests for: payment flows, resume builder, cover letter generator
5. Admin analytics dashboard (user metrics, revenue)

---

## CODING PATTERNS TO FOLLOW

### How to Add a New API Endpoint

**1. Create/update route file** in `backend/src/routes/`:
```typescript
// backend/src/routes/myFeature.ts
import { Router, Request, Response } from 'express';
import { authenticateUser } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { mySchema } from '../validators/schemas.js';
import { supabase } from '../config/supabase.js';

const router = Router();

router.post('/', authenticateUser, validateRequest(mySchema), async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { data, error } = await supabase
      .from('my_table')
      .insert({ user_id: userId, ...req.body })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error('Error in POST /my-feature:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

**2. Register in `backend/src/app.ts`:**
```typescript
import myFeatureRoutes from './routes/myFeature.js';
// ...
app.use('/api/my-feature', generalLimiter, myFeatureRoutes);
```

**3. Add Joi schema** in `backend/src/validators/schemas.ts`:
```typescript
export const mySchema = Joi.object({
  fieldName: Joi.string().required().max(500),
});
```

**4. Add frontend service function** in appropriate `frontend/services/` file:
```typescript
export const createMyThing = async (data: MyType): Promise<MyType> => {
  const token = await getAccessToken();
  const response = await fetch(`${API_BASE_URL}/api/my-feature`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create');
  return response.json();
};
```

### How to Add a New Practice/Learning Module

1. Add database table via new migration in `backend/migrations/` (name: `010_create_X_table.sql`)
2. Add CRUD operations to `backend/src/services/database.ts` (follow `blogDb` pattern)
3. Create route file `backend/src/routes/X.ts` (follow `courses.ts` pattern for public + admin endpoints)
4. Register in `app.ts`
5. Add frontend service in `frontend/services/contentService.ts`
6. Create React component in `frontend/components/`
7. Add route in `frontend/App.tsx` (lazy loaded: `const XPage = lazy(() => import('./components/XPage'))`)
8. Add nav link in `frontend/components/Header.tsx`

### How to Modify AI Grading Prompts

All AI prompts are in `backend/src/routes/gemini.ts`. Each endpoint constructs its prompt inline.

**Resume Analysis prompt** — look for `analyze-resume` route handler. The structured output schema is defined as a TypeScript object passed to `generationConfig.responseSchema`. To change scoring criteria:
```typescript
// In backend/src/routes/gemini.ts — POST /analyze-resume
const prompt = `You are an expert ATS resume analyzer...
// Modify the scoring criteria, section weights, or feedback format here
`;
```

**Cover Letter prompt** — in `generate-cover-letter` route handler.

**Enhancement prompt** — in `enhance-summary` route handler.

**Models to use:**
- `gemini-2.5-flash` → fast operations (enhancements, tailoring)
- `gemini-2.5-pro` → complex/quality operations (analysis, cover letters)

### Error Handling Conventions

```typescript
// Backend: Standard error response pattern
try {
  // operation
  res.json({ success: true, data });
} catch (error) {
  console.error('Error in [ROUTE]:', error);
  // Specific errors first, generic last
  if (error.code === 'PGRST301') {
    return res.status(404).json({ error: 'Not found' });
  }
  res.status(500).json({ error: 'Internal server error' });
}

// Frontend: Service functions throw errors for component handling
try {
  const result = await myService.doThing();
  setData(result);
} catch (error) {
  console.error('Failed:', error);
  setError('Something went wrong. Please try again.');
}
```

**Never expose internal error details** (stack traces, DB errors) to the frontend response.

### Authentication Flow

```
Frontend                          Backend                     Supabase
   │                                 │                            │
   ├─ login(email, pass) ───────────►│                            │
   │                                 ├─ supabase.auth.signIn ────►│
   │                                 │◄─ JWT token ───────────────┤
   │◄─ { token, user } ─────────────┤                            │
   │                                 │                            │
   ├─ API call with Bearer token ───►│                            │
   │                                 ├─ middleware/auth.ts        │
   │                                 ├─ supabase.auth.getUser ───►│
   │                                 │◄─ user object ─────────────┤
   │                                 ├─ req.user = user           │
   │                                 ├─ route handler runs        │
   │◄─ response ────────────────────┤                            │
```

**Auth middleware** (`backend/src/middleware/auth.ts`): Extracts `Authorization: Bearer <token>`, verifies with Supabase service client, attaches `req.user`.

**Admin check** (`backend/src/middleware/adminAuth.ts`): Checks `req.user.user_metadata.role === 'admin'` — set in Supabase dashboard.

**Frontend auth state**: `AuthContext` wraps the app. Use `const { user, session, loading } = useAuth()` in any component.

---

## KEY FILES REFERENCE

| Task | Files to Read/Edit |
|------|--------------------|
| Add/edit route | `backend/src/routes/<feature>.ts` → `backend/src/app.ts` |
| Change AI prompts | `backend/src/routes/gemini.ts` |
| Change free tier limits | `frontend/services/premiumService.ts` |
| Subscription logic | `backend/src/routes/subscriptions.ts` + `backend/src/services/subscription.ts` |
| Database operations | `backend/src/services/database.ts` (all Supabase queries) |
| Resume data structure | `frontend/types.ts` (ResumeData interface) |
| All TypeScript types | `frontend/types.ts` |
| Route definitions | `frontend/App.tsx` |
| Navigation links | `frontend/components/Header.tsx` |
| Auth flow (frontend) | `frontend/src/contexts/AuthContext.tsx` + `frontend/services/userService.ts` |
| Auth flow (backend) | `backend/src/middleware/auth.ts` |
| Email templates | `backend/src/services/emailService.ts` |
| Stripe webhooks | `backend/src/routes/webhooks.ts` |
| Rate limits | `backend/src/middleware/rateLimiting.ts` |
| CORS config | `backend/src/middleware/cors.ts` |
| Security headers | `backend/src/middleware/security.ts` |
| SEO per page | `frontend/src/config/metaTags.ts` |
| Stripe plans/prices | `backend/src/routes/payments.ts` (GET /config) |
| Database schema | `consolidated_production_migration.sql` |
| New DB migration | `backend/migrations/0XX_description.sql` |
| Admin role check | `backend/src/middleware/adminAuth.ts` |
| XSS sanitization | `backend/src/utils/sanitization.ts` |
| Input validation schemas | `backend/src/validators/schemas.ts` |
| Brute force protection | `backend/src/utils/loginAttempts.ts` |

---

## CRITICAL CONTEXT

### FPSC / Grading Standards

There is no FPSC-specific grading standard in this codebase. Resume analysis scoring is handled entirely by the Gemini AI prompt in `backend/src/routes/gemini.ts` (`POST /analyze-resume`). The prompt instructs Gemini to score resumes on ATS compatibility, formatting, content quality, and keyword optimization. **To change scoring criteria, edit the prompt in that route handler.**

### Why Certain Architectural Decisions Were Made

**Monorepo with separate frontend/backend builds**: Frontend deploys as a Vite SPA to Vercel CDN; backend deploys as Vercel serverless functions. This allows independent scaling and deployment while keeping code in one repo.

**Supabase for Auth + Database**: Supabase handles JWT auth, RLS policies, and PostgreSQL. The backend uses the service-role key (bypasses RLS for admin operations); the frontend uses the anon key (RLS enforced). Never expose the service key to the frontend.

**All AI calls go through the backend**: The Gemini API key is only in the backend. Frontend calls `/api/gemini/*` which proxy to Gemini. This prevents key exposure and enables server-side usage tracking/limits.

**React 19 Strict Mode causes double API calls**: In development, effects run twice. The `geminiService.ts` implements request deduplication with an in-flight tracking Map. Do NOT disable Strict Mode — it catches real bugs.

**Subscription tracking in a single `subscriptions` table row per user**: Usage counters (`downloads_used`, `resume_analyses_done`, etc.) are incremented per operation. Weekly plan resets these every 7 days; monthly plan has no enforced limits. The `on_auth_user_created` trigger auto-creates a free subscription row on signup.

**Blogs require DOMPurify on the frontend**: Blog content is stored as HTML (admin enters HTML). `BlogPostPage.tsx` uses `DOMPurify.sanitize()` before rendering via `dangerouslySetInnerHTML`. Never render blog HTML without sanitizing.

### Rate Limits and Quotas

| Service | Limit | Where Configured |
|---------|-------|-----------------|
| Gemini API (AI endpoints) | 500 req/hour | `backend/src/middleware/rateLimiting.ts` |
| Auth endpoints | 10 req/15min | `rateLimiting.ts` (brute force) |
| Payment endpoints | 10 req/hour | `rateLimiting.ts` |
| General API | 100 req/15min | `rateLimiting.ts` |
| Supabase Auth email | 2 unique emails/hour | Supabase free tier dashboard |
| Gemini free tier | Limited tokens/day | Google AI Studio |

**Gemini billing**: User has enabled billing in Google AI Studio. If you see quota errors, check https://aistudio.google.com/

**Supabase free tier**: 500MB DB, 50K MAUs, 2 auth emails/hour. Upgrade triggers: email bottleneck or >500MB storage.

### Third-Party API Integrations

| API | Config Location | Notes |
|-----|----------------|-------|
| Google Gemini | `GEMINI_API_KEY` in backend `.env` | Models: flash (fast), pro (quality) |
| Supabase | `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` (backend), `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (frontend) | Two different keys — service key never in frontend |
| Stripe | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID` | **LIVE MODE in production** — use test keys locally |
| Adzuna | `ADZUNA_APP_ID` + `ADZUNA_APP_KEY` | `POST /api/jobs/admin/sync` — admin-only job sync |
| SendGrid | `SENDGRID_API_KEY` | Welcome emails, payment confirmation, password reset |
| Google Analytics | Hard-coded `G-JB8M2D2SLF` in frontend index.html | No env var needed |

---

## FREE TIER LIMITS (Authoritative — from `frontend/services/premiumService.ts`)

| Feature | Free | Weekly ($9.99) | Monthly ($24.99) |
|---------|------|----------------|-----------------|
| Resume downloads | 3 per period | 20 | Unlimited |
| AI resume analyses | 3 per period | 20 | Unlimited |
| AI cover letters | 3 per period | 20 | Unlimited |
| AI enhancements | **Unlimited** | Unlimited | Unlimited |
| Resume tailoring | **Unlimited** | Unlimited | Unlimited |
| Resume versions saved | 3 total | Unlimited | Unlimited |
| Application tracking | Unlimited | Unlimited | Unlimited |
| Watermark on resume | Yes | No | No |

> **Note**: "Per period" for weekly = resets every 7 days. Monthly = calendar month.

---

## COMMON TASKS CHEATSHEET

### Add a new blog post (via Admin UI)
1. Log in as admin → `/admin` → Blogs tab → Create Blog
2. Status must be `published` to appear publicly

### Fix a subscription counter bug
1. Check column names in `database_schema.sql`
2. Check `frontend/services/premiumService.ts` for `can*()` functions
3. Check `backend/src/routes/subscriptions.ts` for counter increment logic
4. Check `backend/src/routes/gemini.ts` for usage tracking on AI calls

### Add a new resume template
1. Create `frontend/templates/NewTemplate.tsx` (copy ATSTemplate.tsx as base)
2. Add to template selector in `frontend/components/ResumeBuilder.tsx`
3. Add to PDF export switch in `frontend/services/pdfService.ts`

### Test an API endpoint locally
```bash
# Get auth token first (from browser DevTools → Application → Local Storage → supabase.auth.token)
curl -X POST http://localhost:3001/api/gemini/enhance-summary \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text": "Managed team", "section": "experience"}'
```

### Reset a user's subscription usage (dev/admin)
```sql
-- In Supabase SQL editor
UPDATE subscriptions
SET downloads_used = 0,
    resume_analyses_done = 0,
    cover_letters_generated = 0,
    ai_tailoring_used = 0
WHERE user_id = 'USER_UUID_HERE';
```

### Run a database migration
```sql
-- 1. Create file: backend/migrations/010_your_change.sql
-- 2. Run it in Supabase SQL Editor (Dashboard → SQL Editor)
-- 3. Also add to consolidated_production_migration.sql for future fresh installs
```

### Make a page publicly accessible (no login required)
In `frontend/App.tsx`, move the route outside of `<ProtectedRoute>`:
```tsx
// Public — no auth needed:
<Route path="/new-page" element={<NewPage />} />

// Protected — requires login:
<Route element={<ProtectedRoute />}>
  <Route path="/new-page" element={<NewPage />} />
</Route>
```

### Add SEO meta tags for a new page
In `frontend/src/config/metaTags.ts`, add a new entry to the `metaTags` object, then use `<SEO page="newPage" />` at the top of your component.

### Deploy to production
Push to `main` branch → Vercel auto-deploys (CI/CD configured). Frontend and backend deploy independently via their respective `vercel.json` configs.

### Check Stripe webhooks locally
```bash
# Install Stripe CLI, then:
stripe listen --forward-to localhost:3001/api/webhooks/stripe
```

---

## AGENT WORKFLOW INSTRUCTIONS

### Before Making Any Change
1. **Read the target file first** — never edit blind. Schema mismatches and overwrites cost more time than the read.
2. **Grep for existing implementations** before adding new ones: `grep -rn "functionName" frontend/`
3. **Check column names against `database_schema.sql`** before any Supabase query

### Git Workflow
- All development on the designated `claude/` branch for the session
- Commit frequently with descriptive messages
- Push with: `git push -u origin <branch-name>`
- Branch naming: always `claude/<description>-<sessionId>`
- Never push to `main` directly

### Code Quality Rules
- TypeScript types go in `frontend/types.ts` — do not scatter interfaces across component files
- Input validation: always add Joi schema in `backend/src/validators/schemas.ts` for new POST/PUT endpoints
- Sanitize user-submitted HTML content using functions in `backend/src/utils/sanitization.ts`
- All Supabase queries in the backend go through `backend/src/services/database.ts` — do not put raw Supabase queries in route handlers except for simple one-off operations

### Testing
```bash
# Run before pushing
cd backend && npm test               # Unit + integration
npm run test:e2e                     # E2E (from project root, servers must be running)
```
- E2E tests use `e2e-test-*@mailinator.com` pattern — safe to delete after tests
- Do not add real emails to E2E tests
- Gemini and Adzuna are **mocked** in E2E tests; Stripe and Supabase are **real** (test mode)

### When Something Is Broken
- Check `GET /health` first for server status
- For 401 errors: verify `Authorization: Bearer <token>` header and token expiry
- For RLS errors (403 from Supabase): verify `user_id` matches auth user
- For Gemini errors: check API key and quota at https://aistudio.google.com/
- For Stripe issues: check webhook signature and event logs in Stripe Dashboard
- For email issues: check SendGrid activity feed

---

*Last updated: 2026-02-27 | Version: 1.0 | Status: LIVE IN PRODUCTION*
