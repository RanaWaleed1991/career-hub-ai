# Premium Expert Review — Implementation Plan

## Overview
Add a "Expert Resume Review" one-time purchase ($89 AUD) that includes:
- Professional human resume review + rewrite (PDF delivery)
- 1 month of all Premium features (unlimited AI tools, no watermarks)
- Industry-specific questionnaire from expert
- 3-5 business day turnaround

## Architecture Decision: One-Time Purchase + Monthly Activation
- NOT a new subscription tier — it's a one-time Stripe payment
- On successful payment: create `expert_reviews` row + activate monthly plan for 30 days
- This keeps the pricing page clean and positions it as a premium service

## Phase 1 — MVP Implementation Steps

### Step 1: Database Migration
**File:** `backend/migrations/010_create_expert_reviews_table.sql`

Create `expert_reviews` table:
- id, user_id, status (enum-like text), stripe_payment_intent_id
- amount_paid, paid_at
- original_resume_url, original_resume_filename, submitted_at
- questionnaire (JSONB), questionnaire_answers (JSONB)
- questionnaire_sent_at, questionnaire_completed_at
- rewritten_resume_url, rewritten_resume_filename
- completed_at, delivered_at, admin_notes
- created_at, updated_at

Status flow: `pending_payment → pending_submission → submitted → in_review → questionnaire_sent → questionnaire_completed → revision_in_progress → completed`

RLS policies: users see only own reviews.

Also add to `consolidated_production_migration.sql`.

### Step 2: Supabase Storage Bucket
Create `expert-reviews` storage bucket (via SQL or Supabase dashboard).
RLS: users can upload to own folder, download own files. Admin (service key) can access all.

### Step 3: Backend — Stripe Configuration
**File:** `backend/src/config/stripe.ts`

Add expert review product config:
- New env var: `STRIPE_PRICE_ID_EXPERT_REVIEW` (one-time price, $89)
- Add to config exports

**File:** `backend/.env.example`
Add `STRIPE_PRICE_ID_EXPERT_REVIEW`

### Step 4: Backend — Expert Review Routes
**File:** `backend/src/routes/expertReview.ts`

User endpoints (authenticated):
- `POST /checkout` — Create Stripe checkout session for one-time $89 payment
- `GET /status` — Get current review status + details
- `POST /submit-resume` — Upload original resume PDF (multipart form)
- `GET /questionnaire` — Get expert's questions
- `POST /questionnaire` — Submit answers
- `GET /download` — Download rewritten resume (signed URL)

Admin endpoints (authenticated + admin):
- `GET /admin/orders` — List all reviews with status filter + pagination
- `GET /admin/:id` — Get full review details
- `PUT /admin/:id/status` — Update status
- `POST /admin/:id/questionnaire` — Set questionnaire questions
- `POST /admin/:id/upload` — Upload rewritten resume PDF
- `GET /admin/:id/download-original` — Download user's uploaded resume
- `GET /admin/:id/answers` — View questionnaire answers

### Step 5: Backend — Register Routes
**File:** `backend/src/app.ts`

Mount: `app.use('/api/expert-review', generalLimiter, expertReviewRoutes)`

### Step 6: Backend — Webhook Handler Update
**File:** `backend/src/routes/webhooks.ts`

Handle `checkout.session.completed` for expert review:
- Check metadata for `type: 'expert_review'`
- Update `expert_reviews` row: status → pending_submission, payment fields
- Activate user's monthly plan for 30 days (reuse existing subscription logic)
- Send confirmation email

### Step 7: Backend — Validation Schemas
**File:** `backend/src/validators/schemas.ts`

Add schemas for:
- questionnaire submission (array of {question, answer})
- admin questionnaire creation (array of {question, type})
- status update (valid status values)

### Step 8: Backend — Email Templates
**File:** `backend/src/services/emailService.ts`

Add email functions:
- `sendExpertReviewConfirmation(user)` — payment confirmed
- `sendResumeSubmittedNotification(adminEmail, reviewDetails)` — notify admin
- `sendQuestionnaireReady(user)` — expert has questions
- `sendQuestionnaireCompletedNotification(adminEmail, reviewDetails)` — notify admin
- `sendRewrittenResumeReady(user)` — resume delivered

### Step 9: Backend — Database Service
**File:** `backend/src/services/database.ts`

Add `expertReviewDb` object with CRUD operations:
- create, getByUserId, getById, updateStatus
- setQuestionnaire, submitAnswers
- setRewrittenResume, getAll (admin)

### Step 10: Frontend — TypeScript Types
**File:** `frontend/types.ts`

Add interfaces:
- `ExpertReview` (matches DB schema)
- `ExpertReviewStatus` (union type of all statuses)
- `QuestionnaireQuestion` ({question: string, type: 'text'|'textarea'|'select', options?: string[]})
- `QuestionnaireAnswer` ({question: string, answer: string})

### Step 11: Frontend — API Service
**File:** `frontend/services/expertReviewService.ts`

Functions:
- `createExpertReviewCheckout()` — POST /checkout
- `getExpertReviewStatus()` — GET /status
- `submitResume(file: File)` — POST /submit-resume (multipart)
- `getQuestionnaire()` — GET /questionnaire
- `submitQuestionnaire(answers)` — POST /questionnaire
- `downloadRewrittenResume()` — GET /download

### Step 12: Frontend — Expert Review Landing Page
**File:** `frontend/components/ExpertReviewPage.tsx`

Route: `/expert-review`

Sections:
- Hero: "Get Your Resume Professionally Rewritten by a Career Expert"
- How it works: 4-step visual process
- What's included: checklist of benefits
- Expert credentials (anonymous): years of experience, industries, results
- Pricing: $89 one-time, includes 1 month Premium
- Comparison: "$89 vs $200-$500 at traditional resume services"
- FAQ section
- CTA button → Stripe checkout

### Step 13: Frontend — Expert Review Dashboard Widget
**File:** `frontend/components/ExpertReviewDashboard.tsx`

Embedded in user dashboard. Shows different states:
- No active review: "Get Expert Review" CTA
- pending_submission: File upload area + instructions
- submitted: "Resume received — expert is reviewing" + progress bar
- questionnaire_sent: Questionnaire form with questions from expert
- questionnaire_completed: "Expert is working on your rewrite" + progress bar
- completed: Download button + "Your expertly rewritten resume is ready!"

### Step 14: Frontend — Admin Panel Tab
**File:** `frontend/components/AdminPage.tsx` (modify existing)

New "Expert Reviews" tab with:
- Orders table: user, status, submitted date, actions
- Status filter dropdown
- Per-order detail view:
  - Download original resume
  - View questionnaire answers
  - Add/edit questionnaire questions
  - Upload rewritten resume
  - Update status dropdown
  - Admin notes field

### Step 15: Frontend — Routing
**File:** `frontend/App.tsx`

Add routes:
- `/expert-review` — public (landing/marketing page)
- Dashboard integration (no separate route needed, it's a widget)

### Step 16: Frontend — Navigation
**File:** `frontend/components/Header.tsx`

Add "Expert Review" link in navigation (could be under a "Services" dropdown or standalone)

### Step 17: Frontend — SEO
**File:** `frontend/src/config/metaTags.ts`

Add meta tags for `/expert-review` page

### Step 18: Frontend — Pricing Page Update
**File:** `frontend/src/components/payments/PricingPage.tsx`

Add an "Expert Review" card/banner either:
- As a highlighted card alongside the 3 tiers
- Or as a separate section below: "Want a human touch? Get Expert Review"

### Step 19: Update Dashboard
**File:** `frontend/components/Dashboard.tsx`

Add Expert Review status widget if user has an active review

### Step 20: Testing
- Add backend unit tests for expert review routes
- Add admin endpoint tests
- Test Stripe checkout flow (test mode)
- Test file upload/download
- Test status transitions
- Test email notifications

## File Dependency Order
Build in this order to avoid broken imports:
1. Database migration (Step 1)
2. Types (Step 10)
3. Backend config (Step 3)
4. Backend DB service (Step 9)
5. Backend validation (Step 7)
6. Backend email (Step 8)
7. Backend routes (Step 4)
8. Backend app.ts registration (Step 5)
9. Backend webhook update (Step 6)
10. Frontend service (Step 11)
11. Frontend components (Steps 12-14)
12. Frontend routing + nav (Steps 15-17)
13. Frontend pricing + dashboard updates (Steps 18-19)
14. Testing (Step 20)

## Future Phases (NOT in Phase 1)
- Expert portal (brother logs in directly)
- In-app messaging between user and expert
- Multiple expert support with assignment
- Before/after resume comparison view
- Revision request flow
- SLA tracking and automated reminders
- Expert ratings/reviews
