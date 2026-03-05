# CareerHub AI — Technical Architecture Breakdown
### Interview Preparation & Learning Guide

> **Purpose:** Equip you to speak confidently about CareerHub AI in technical interviews.
> This document maps every feature to the real code behind it, explains WHY decisions were made,
> and gives you precise language to use with technical hiring managers.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [My Role vs. What Claude Code Implemented](#2-my-role-vs-what-claude-code-implemented)
3. [Feature-by-Feature Technical Analysis](#3-feature-by-feature-technical-analysis)
4. [Technical Concepts Glossary](#4-technical-concepts-glossary)
5. [Debugging & Iteration Log](#5-debugging--iteration-log)
6. [JavaScript/TypeScript & Node.js Knowledge Required](#6-javascripttypescript--nodejs-knowledge-required)
7. [Recommended 2-Week Learning Path](#7-recommended-2-week-learning-path)
8. [Feature 12: Expert Resume Review (Added 2026-03-05)](#8-feature-12-expert-resume-review-added-2026-03-05)

---

## 1. Project Overview

### What CareerHub AI Is

A production SaaS (Software as a Service) platform for AI-powered career development. Real users pay real money to use it. It is live at **https://www.careerhubai.com.au**.

Core capabilities:
- Build and export professional resumes (6 templates)
- AI analysis of resumes for ATS compatibility scoring
- AI-generated cover letters tailored to job descriptions
- AI resume tailoring for specific job descriptions
- Skill gap auditing (match your resume to a job description)
- Selection criteria response generation (STAR method)
- Job application tracking
- Course catalogue
- Blog system with SEO
- Stripe subscription billing (weekly/monthly paid plans)

### Tech Stack (What Is Actually Running)

| Layer | Technology | Version | Why It Was Chosen |
|-------|------------|---------|-------------------|
| **Frontend UI** | React | 19 | Industry-standard component library; large ecosystem |
| **Frontend Language** | TypeScript | ~5.8 | Adds type safety to JavaScript; catches bugs before runtime |
| **Frontend Build Tool** | Vite | 6.2 | Faster than Webpack; excellent hot-reloading in dev |
| **Frontend Routing** | React Router | v7 | Declarative client-side routing for SPAs |
| **Frontend Styling** | TailwindCSS | latest | Utility-first CSS; rapid UI without writing custom stylesheets |
| **Backend Runtime** | Node.js | latest LTS | Same language (JavaScript/TypeScript) as frontend |
| **Backend Framework** | Express | 4.18 | Minimal, flexible HTTP server; industry standard |
| **Backend Language** | TypeScript | ~5.8 | Shared type definitions with frontend |
| **Database** | Supabase (PostgreSQL) | latest | Managed Postgres with built-in auth, RLS policies, and real-time |
| **Auth Provider** | Supabase Auth | — | JWT-based auth; handles OAuth, sessions, password reset |
| **AI Model Provider** | Google Gemini API | @google/genai 1.26 | Generous free tier; strong JSON schema enforcement for structured output |
| **AI Models Used** | gemini-2.5-flash / gemini-2.5-pro | — | Flash = fast/cheap; Pro = higher reasoning quality |
| **Payments** | Stripe | SDK 19.3 | Industry standard; handles PCI compliance, webhooks, portals |
| **Email** | SendGrid | SDK 8.1 | Reliable transactional email; deliverability tooling |
| **Job Data** | Adzuna API | — | Third-party job board API for populating job listings |
| **PDF Export** | html2pdf.js | 0.10 | Browser-side HTML-to-PDF rendering |
| **PDF Import** | pdfjs-dist | 5.4 | Extract text from uploaded PDFs |
| **Input Validation** | Joi | 18 | Schema-based validation library for all API request bodies |
| **Rate Limiting** | express-rate-limit | 8.2 | Prevent API abuse and brute force attacks |
| **Security Headers** | Helmet | 8.1 | Sets HTTP security headers (CSP, HSTS, etc.) |
| **Error Monitoring** | Sentry | 10.28 | Captures and reports runtime errors in production |
| **Analytics** | Google Analytics 4 | G-JB8M2D2SLF | Page views and user behaviour tracking |
| **Hosting** | Vercel | — | Frontend as CDN-cached SPA; backend as serverless functions |
| **E2E Testing** | Playwright | latest | Browser automation for end-to-end test flows |
| **Unit/Integration Tests** | Jest + Supertest | 29 | Backend unit and API integration tests |
| **XSS Protection (frontend)** | DOMPurify | — | Sanitises HTML before rendering blog content |

### Deployment Architecture (How It All Connects)

```
Browser (User)
     │
     ▼
Vercel CDN ──────────────── frontend/  (React SPA)
     │                      Built by Vite → static files
     │                      All routes → index.html (SPA)
     │
     ├─── /api/* calls ───► Vercel Serverless Function
     │                      backend/src/server.ts → Express app
     │                           │
     │                    ┌──────┴──────┐────────────────┐
     │                    ▼            ▼                 ▼
     │               Supabase       Gemini API        Stripe API
     │             (PostgreSQL       (AI models)      (Payments)
     │              + Auth)
     │
     └─── Auth ──────────► Supabase Auth (JWT tokens)
                           ↓
                    Row-Level Security
                    (user only sees own data)
```

**Key architectural insight:** The frontend never talks to Gemini or Stripe directly. All AI calls and payment operations go through the backend, which holds the API keys. This is a security requirement: API keys must never be exposed in browser-side code.

---

## 2. My Role vs. What Claude Code Implemented

Understanding this distinction is critical for interviews. You are the **product owner and AI director** — Claude Code is the **engineering executor**.

### What YOU Designed and Configured

| Category | Your Contribution |
|----------|------------------|
| **Product Vision** | Defined all six feature modules, user flows, and the subscription tier model |
| **Business Logic** | Decided free vs. paid limits (3 analyses free, 3 cover letters free, unlimited enhancements) |
| **AI Strategy** | Chose Google Gemini over OpenAI; decided which tasks use Flash (speed) vs. Pro (quality) |
| **Prompt Design** | Wrote the content of every AI prompt — what the AI is asked to do, what format it returns, what constraints it operates under |
| **Data Modelling** | Defined the resume structure (PersonalDetails, Experience, Education, Skills, etc.) and how features share usage counters |
| **UX Decisions** | Designed the 6 resume templates, the megamenu navigation groupings, the STAR-format output for selection criteria |
| **Integration Choices** | Chose Supabase (not Firebase), Stripe (not PayPal), SendGrid (not Mailgun), Adzuna (not Indeed API) |
| **Deployment Strategy** | Chose Vercel monorepo deployment (frontend CDN + backend serverless) |
| **Security Policies** | Defined rate limits per endpoint type, chose Row-Level Security enforcement in Supabase |

### What Claude Code Implemented

| Category | Claude Code's Contribution |
|----------|--------------------------|
| **Code Architecture** | Express middleware stack, service layer pattern, database abstraction (database.ts) |
| **All Route Files** | 12 backend route files with authentication, validation, error handling |
| **Gemini Integration** | JSON schema-enforced structured output, model selection, prompt formatting with user data |
| **Frontend Components** | 38+ React components, TypeScript interfaces, service functions |
| **Auth Middleware** | JWT extraction, Supabase token verification, req.user attachment |
| **Validation Schemas** | All 12+ Joi schemas for request body validation |
| **Database Service** | 6 database objects (resumeDb, versionDb, subscriptionDb, etc.) with 40+ query functions |
| **Stripe Integration** | Checkout session creation, webhook signature verification, subscription state management |
| **Security Hardening** | Helmet headers, CORS config, input sanitisation, brute force protection |
| **Test Suite** | 274 unit/integration tests + 38 E2E Playwright tests |

### How to Frame This in an Interview

> *"I directed the build of CareerHub AI using Claude Code as my engineering partner. I defined all the product requirements, designed the AI prompt strategies, made the architectural decisions (tech stack, data model, security policies), and Claude Code wrote the implementation code. I can speak to why every technical decision was made, because I made those decisions."*

---

## 3. Feature-by-Feature Technical Analysis

---

### Feature 1: AI Resume Analysis (ATS Scoring)

#### What I Designed/Configured
- Requirement: Give users an ATS compatibility score (0–100) with section-by-section feedback
- Decided to use `gemini-2.5-pro` (not Flash) because quality of feedback matters more than speed here
- Designed the output schema: score, overall feedback, per-section ratings (Poor/Fair/Good/Excellent), recruiter summary
- Set limits: 3 free, 10/weekly plan, unlimited/monthly plan

#### What Claude Code Implemented
- **Route:** `POST /api/gemini/analyze-resume` in `backend/src/routes/gemini.ts`
- **Service function:** `analyzeResume()` in `frontend/services/geminiService.ts`
- **Frontend component:** `frontend/components/ResumeAnalyserPage.tsx`
- **Validation schema:** `analyzeResumeSchema` in `backend/src/validators/schemas.ts`
- The backend checks `resume_analyses_done` counter in the `subscriptions` table before calling Gemini
- Returns a `ResumeAnalysisResult` TypeScript interface defined in `frontend/types.ts`

#### AI Concepts Utilized

| Concept | How It's Used Here |
|---------|-------------------|
| **Prompt Engineering** | The prompt instructs Gemini to act as an "expert ATS resume analyzer", specifies scoring dimensions (formatting, keywords, content), and mandates the exact JSON structure for the response |
| **Structured JSON Output** | `responseMimeType: 'application/json'` + `responseSchema` passed to Gemini ensures the response matches `ResumeAnalysisResult` — not free-form text |
| **API Integration** | `@google/genai` SDK call with model `gemini-2.5-pro`, response parsed and returned to frontend |

#### Key Code Location
- `backend/src/routes/gemini.ts` — POST `/analyze-resume` handler
- `frontend/types.ts` — `ResumeAnalysisResult` interface (lines ~150–165)

#### Interview Talking Point
> *"I designed an ATS resume analyser where the AI returns a structured score and section-by-section feedback. The key technical decision was enforcing JSON schema on the Gemini response — without that, LLM output is unpredictable and can't be safely rendered in a UI."*

---

### Feature 2: AI Cover Letter Generator

#### What I Designed/Configured
- Requirement: Generate a personalised, professional cover letter using the user's resume + a job description they paste in
- Chose `gemini-2.5-pro` for quality prose generation
- Set limits: 3 free, then paid only
- Decided cover letter text is returned as a plain string (not JSON schema), because prose doesn't need structured parsing

#### What Claude Code Implemented
- **Route:** `POST /api/gemini/generate-cover-letter` in `backend/src/routes/gemini.ts`
- **Service function:** `generateCoverLetter(resumeText, jobTitle, company, jobDescription)` in `frontend/services/geminiService.ts`
- **Frontend component:** `frontend/components/CoverLetterBuilder.tsx`
- **Validation schema:** `generateCoverLetterSchema` — validates `resumeText`, `jobTitle`, `company`, `jobDescription` are all present
- Increments `cover_letters_generated` in the `subscriptions` table after successful generation

#### AI Concepts Utilized

| Concept | How It's Used Here |
|---------|-------------------|
| **Prompt Engineering** | Prompt includes user's resume text + job description as context; instructs Gemini to write a professional, personalised letter matching the role |
| **API Integration** | `gemini-2.5-pro` model call; response is streamed back as text |
| **Context Window Usage** | Full resume text + job description are injected into the prompt body — this is "context stuffing," not RAG, because the data is small enough to fit in one prompt |

#### Key Code Location
- `backend/src/routes/gemini.ts` — POST `/generate-cover-letter` handler
- `backend/src/validators/schemas.ts` — `generateCoverLetterSchema`

#### Interview Talking Point
> *"The cover letter generator uses contextual prompt engineering — I pass the user's full resume and the target job description directly into the Gemini prompt. The model synthesises both to write a tailored letter. I made the decision NOT to use JSON schema output here because cover letters are prose, not structured data."*

---

### Feature 3: Resume Tailoring for a Job

#### What I Designed/Configured
- Requirement: Rewrite a user's resume to better match a specific job description (keyword optimisation, reordering)
- Chose `gemini-2.5-pro` over Flash — rewriting a resume requires reasoning about relevance, not just generation speed
- Decided this should be unlimited for all plans (including free) as a growth/engagement driver

#### What Claude Code Implemented
- **Route:** `POST /api/gemini/tailor-resume` in `backend/src/routes/gemini.ts`
- **Frontend component:** `frontend/components/TailorResumeModal.tsx` (modal overlay on the Resume Builder)
- **Service function:** `tailorResumeForJob(resumeText, jobDescription)` in `frontend/services/geminiService.ts`
- **Validation schema:** `tailorResumeSchema`

#### AI Concepts Utilized

| Concept | How It's Used Here |
|---------|-------------------|
| **Prompt Engineering** | Instructs Gemini to rewrite experience bullet points to incorporate job description keywords while keeping the meaning factually accurate |
| **Context Window Usage** | Full resume + full JD passed in one prompt — fits within Gemini's context window |

#### Key Code Location
- `backend/src/routes/gemini.ts` — POST `/tailor-resume` handler
- `frontend/components/TailorResumeModal.tsx`

#### Interview Talking Point
> *"Resume tailoring feeds the user's entire resume and job description into Gemini with instructions to rewrite for ATS keyword alignment. A key design decision was making this unlimited for free users — it's a core value-driver that increases engagement and conversion to paid plans."*

---

### Feature 4: Skill Gap Audit (Career Intelligence Module B)

#### What I Designed/Configured
- Requirement: Show users exactly how well their resume matches a job description — with a score and prioritised missing skills
- Designed the full output schema: `matchScore` (0–100), `presentSkills` (with strength: strong/moderate/mentioned), `missingSkills` (with priority: critical/important/nice-to-have), `keywordGaps`, `recommendations` (per-skill actions: highlight/learn/reframe), `strengthAreas`, `improvementAreas`
- Decided to share the `resume_analyses_done` counter with the ATS analyser (same "analysis" type of feature) — avoiding a new DB column

#### What Claude Code Implemented
- **Route:** `POST /api/gemini/skill-gap-analysis` in `backend/src/routes/gemini.ts`
- **Frontend component:** `frontend/components/SkillGapPage.tsx`
- **Service function:** `analyzeSkillGap(resumeText, jobDescription)` in `frontend/services/geminiService.ts`
- **TypeScript types:** `SkillGapResult`, `PresentSkill`, `MissingSkill`, `SkillRecommendation` in `frontend/types.ts`
- **Validation schema:** `skillGapSchema`
- Uses `gemini-2.5-flash` (faster, lower cost) with full `responseSchema` enforcement

#### AI Concepts Utilized

| Concept | How It's Used Here |
|---------|-------------------|
| **Structured JSON Output** | `responseSchema` defines every field Gemini must return — `matchScore` (integer), `presentSkills` (array of objects), `missingSkills` (array with enum priority values), etc. Gemini cannot deviate from this schema |
| **Prompt Engineering** | Prompt provides resume + JD, instructs Gemini to compare them systematically, classify each skill by type (technical/soft/certification/domain) and strength/priority |
| **API Integration** | `gemini-2.5-flash` — chosen for this endpoint because it's called frequently and the structured schema compensates for using a lighter model |

#### Key Code Location
- `backend/src/routes/gemini.ts` — POST `/skill-gap-analysis` handler
- `frontend/types.ts` — `SkillGapResult` interface
- `frontend/components/SkillGapPage.tsx`

#### Interview Talking Point
> *"The Skill Gap Audit was the most schema-intensive feature I designed. I architected a structured output with 7 distinct data fields — some with nested arrays of objects with enum constraints. This required careful Gemini response schema design because if the AI returns an unexpected field type, the TypeScript interface breaks and the UI crashes."*

---

### Feature 5: Selection Criteria Generator (Career Intelligence Module A)

#### What I Designed/Configured
- Requirement: Australian government job applications require responses to 'selection criteria' — structured paragraphs that prove you meet each requirement. Automate this.
- Designed the STAR-method output structure: per-criterion, per-type (essential/desirable), with situation + task + action + result fields AND a `fullResponse` prose paragraph (150–250 words)
- Added `confidence` field (high/medium/low) — so users know which responses are well-supported by their resume vs. which need manual improvement
- Decided to share `cover_letters_generated` counter (both are "written content generation" tasks)

#### What Claude Code Implemented
- **Route:** `POST /api/gemini/selection-criteria` in `backend/src/routes/gemini.ts`
- **Frontend component:** `frontend/components/SelectionCriteriaPage.tsx`
- **Service function:** `generateSelectionCriteria(resumeText, jobDescription)` in `frontend/services/geminiService.ts`
- **TypeScript types:** `SelectionCriteriaResult`, `SelectionCriterion`, `StarResponse` in `frontend/types.ts`
- **Validation schema:** `selectionCriteriaSchema`

#### AI Concepts Utilized

| Concept | How It's Used Here |
|---------|-------------------|
| **Structured JSON Output** | `responseSchema` enforces `criteria` array where each element has `type` (enum: essential/desirable), `confidence` (enum: high/medium/low), `starResponse` (object), and `fullResponse` (string) |
| **Prompt Engineering** | Prompt instructs Gemini to first extract every criterion from the JD, classify each as essential or desirable, then draft a STAR-format response using ONLY evidence from the resume — not invented experience |
| **Grounding/Faithfulness** | Prompt explicitly instructs Gemini not to fabricate achievements not in the resume, and to flag low confidence when evidence is weak |

#### Key Code Location
- `backend/src/routes/gemini.ts` — POST `/selection-criteria` handler
- `frontend/types.ts` — `SelectionCriteriaResult`, `SelectionCriterion`, `StarResponse`
- `frontend/components/SelectionCriteriaPage.tsx`

#### Interview Talking Point
> *"The selection criteria generator is unique because it chains two AI tasks in one prompt: first extract and classify the criteria from the job description, then draft evidence-based responses from the resume for each. I designed the confidence score field specifically for trust and transparency — users see when the AI is guessing versus when it has solid evidence."*

---

### Feature 6: Resume Builder with 6 Templates

#### What I Designed/Configured
- Requirement: Real-time resume editor with live preview and template switching
- Defined the complete `ResumeData` TypeScript interface: `PersonalDetails`, `Experience[]`, `Education[]`, `Skill[]`, `Certification[]`, `Reference[]`, `CustomSection[]`
- Chose 6 distinct template types to cover different use cases: Classic (traditional), Modern (contemporary), Australian (local market), Picture (profile photo), ATS (plain-text optimised), Minimal (clean)
- Designed JSONB storage — the entire resume object is stored as one JSON blob in PostgreSQL, not normalised across multiple tables (simpler, faster for this use case)
- Decision to offer `LayoutStyle` variants (`traditional`, `skills-first`, `australian`) on top of template types

#### What Claude Code Implemented
- **Frontend component:** `frontend/components/ResumeBuilder.tsx` (core editor)
- **Templates:** `frontend/templates/` — 6 TypeScript components (`ClassicTemplate.tsx`, `ModernTemplate.tsx`, `AustralianTemplate.tsx`, `PictureTemplate.tsx`, `ATSTemplate.tsx`, `MinimalTemplate.tsx`)
- **Data persistence:** `frontend/services/resumeService.ts` with `saveResume()`, `getLatestResume()`, `getAllResumes()`
- **PDF export:** `frontend/services/pdfService.ts` using `html2pdf.js` — renders the active template DOM to PDF
- **Backend routes:** `backend/src/routes/resumes.ts` — full CRUD (Create, Read, Update, Delete, Activate)
- **Database:** `resumeDb` object in `backend/src/services/database.ts` with 7 query functions

#### AI Concepts Utilized

| Concept | How It's Used Here |
|---------|-------------------|
| **AI Text Enhancement** | `POST /api/gemini/enhance-summary` uses `gemini-2.5-flash` to improve bullet points in experience/summary sections on demand |
| **Prompt Engineering** | Enhancement prompt specifies which section (summary/experience) to tailor the rewriting style |

#### Key Code Location
- `frontend/components/ResumeBuilder.tsx` — editor
- `frontend/templates/*.tsx` — 6 template components
- `backend/src/routes/resumes.ts` — CRUD routes
- `backend/src/services/database.ts` — `resumeDb` object

#### Interview Talking Point
> *"I chose JSONB storage for resume data rather than a normalised relational schema — each resume is one JSON blob in PostgreSQL. This was intentional: resumes have deeply nested, variable-length data (different numbers of experience entries, optional sections). JSONB gives schema flexibility while keeping all resume data retrievable in one query."*

---

### Feature 7: Authentication & User Management

#### What I Designed/Configured
- Chose Supabase Auth (not rolling a custom auth system) — handles JWT issuance, refresh, OAuth providers, email templates
- Chose Google OAuth only (removed Facebook OAuth in December 2025 — low usage, maintenance overhead)
- Designed Row-Level Security policy: every table has `user_id = auth.uid()` enforcement so users can only read/write their own rows
- Designed the `on_auth_user_created` database trigger: automatically creates a `subscriptions` row (free plan) for every new user

#### What Claude Code Implemented
- **Frontend context:** `frontend/src/contexts/AuthContext.tsx` — global auth state using React Context API
- **Auth routes:** `backend/src/routes/auth.ts` — signup, login, logout, Google OAuth, password reset, token refresh
- **Auth middleware:** `backend/src/middleware/auth.ts` — extracts `Bearer <token>`, verifies with Supabase, attaches `req.user`
- **Admin middleware:** `backend/src/middleware/adminAuth.ts` — checks `req.user.user_metadata.role === 'admin'`
- **Brute force protection:** `backend/src/utils/loginAttempts.ts` — tracks failed login attempts per IP
- **Rate limiting:** Auth endpoints limited to 10 requests per 15 minutes via `express-rate-limit`

#### Key Code Location
- `frontend/src/contexts/AuthContext.tsx`
- `backend/src/middleware/auth.ts`
- `backend/src/routes/auth.ts`

#### Interview Talking Point
> *"Authentication is handled by Supabase Auth, which issues JWTs. Every protected API endpoint runs middleware that verifies the token with Supabase's service client. I designed the Row-Level Security at the database level — even if the backend had a bug and sent the wrong user_id, the database would reject the query. Defence in depth."*

---

### Feature 8: Stripe Subscription Billing

#### What I Designed/Configured
- Designed two paid tiers: Weekly ($9.99/week) and Monthly ($24.99/month)
- Defined the free tier limits and what each paid tier unlocks
- Chose Stripe Checkout (hosted page) over building a custom payment form — no PCI compliance burden
- Designed the usage counter approach: increment DB columns per AI action, check counters before allowing features
- Defined webhook events to handle: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`

#### What Claude Code Implemented
- **Payment routes:** `backend/src/routes/payments.ts` — checkout session, portal session, subscription status, cancel, reactivate
- **Webhook handler:** `backend/src/routes/webhooks.ts` — Stripe event verification (signature check), subscription state sync to DB
- **Subscription service:** `backend/src/services/subscription.ts` — Stripe API interactions
- **Frontend service:** `frontend/services/premiumService.ts` — `canDownloadResume()`, `canGenerateCoverLetter()`, `canAnalyzeResume()`, etc.
- **Pricing page:** `frontend/src/components/payments/PricingPage.tsx`
- **Subscription management:** `frontend/src/components/payments/SubscriptionManagement.tsx`
- **Critical:** Stripe webhook receives raw body — implemented **before** Express JSON parsing middleware in `app.ts` to preserve the raw body needed for signature verification

#### Key Code Location
- `backend/src/routes/payments.ts`
- `backend/src/routes/webhooks.ts`
- `frontend/services/premiumService.ts`
- `backend/src/app.ts` — webhook route registered before JSON body parser

#### Interview Talking Point
> *"The most non-obvious architectural detail in the payment system is that the Stripe webhook route must receive the raw HTTP body — before Express parses it as JSON. If Express parses the body first, the HMAC signature verification fails and Stripe events can't be processed. I designed the middleware order in app.ts with this specifically in mind."*

---

### Feature 9: Job Application Tracker

#### What I Designed/Configured
- Simple kanban-style tracker: Applied → Interviewing → Offer → Rejected
- Defined the schema: `company`, `position` (not `role`), `status`, `applied_date` (not `date_applied`) — precise column names matter in Supabase RLS queries
- Decided this is unlimited for all plans (free and paid) — a utility tool, not an AI resource

#### What Claude Code Implemented
- **Backend routes:** `backend/src/routes/applications.ts` — CRUD for applications
- **Database service:** `applicationDb` in `backend/src/services/database.ts`
- **Frontend component:** `frontend/components/ApplicationTrackerPage.tsx`
- **Frontend service:** `frontend/services/applicationService.ts`
- **Validation:** `createApplicationSchema`, `updateApplicationSchema` in `schemas.ts`

#### Key Code Location
- `backend/src/routes/applications.ts`
- `frontend/components/ApplicationTrackerPage.tsx`

#### Interview Talking Point
> *"The application tracker is a straightforward CRUD feature with Supabase RLS — users can only see their own applications because PostgreSQL enforces `user_id = auth.uid()` at the database layer. No application-level filtering code needed."*

---

### Feature 10: Resume Version History

#### What I Designed/Configured
- Requirement: Allow users to save named snapshots of their resume and restore them
- Set free tier limit at 3 saved versions (promotes paid conversion)
- Decided versions store a full copy of the `ResumeData` JSONB — not a diff/delta — simpler to restore

#### What Claude Code Implemented
- **Backend routes:** `backend/src/routes/versions.ts` — save version, list versions, restore version
- **Database service:** `versionDb` in `backend/src/services/database.ts`
- **Frontend component:** `frontend/components/VersionHistoryPage.tsx`
- **Frontend service:** `frontend/services/versionHistoryService.ts`

#### Key Code Location
- `backend/src/routes/versions.ts`
- `backend/src/services/database.ts` — `versionDb`

#### Interview Talking Point
> *"Version history stores full JSONB snapshots, not diffs. This is an intentional trade-off: storage is cheap, but implementing diffing/patching logic is complex and error-prone. For the volume of data involved (a resume is rarely more than 10KB), full snapshots are the correct choice."*

---

### Feature 11: Blog System with SEO

#### What I Designed/Configured
- Requirements: Admin creates blog posts (HTML content), posts appear publicly with search, SEO meta tags
- Chose slug-based URLs (`/blog/how-to-write-an-ats-resume`) for SEO-friendly permanent links
- Designed view counter (increment on each public read)
- Required XSS protection: blog content is raw HTML entered by admin, must be sanitised before rendering

#### What Claude Code Implemented
- **Backend routes:** `backend/src/routes/blogs.ts` — public list/single, admin CRUD
- **Database service:** `blogDb` in `backend/src/services/database.ts`
- **Frontend components:** `BlogsPage.tsx` (listing + search), `BlogPostPage.tsx` (single post with DOMPurify sanitisation)
- **SEO:** `frontend/src/config/metaTags.ts` — per-page meta tags; `frontend/src/components/SEO.tsx` — `react-helmet-async` wrapper
- **XSS protection:** `DOMPurify.sanitize()` wrapping `dangerouslySetInnerHTML` in `BlogPostPage.tsx`

#### Key Code Location
- `frontend/components/BlogPostPage.tsx` — DOMPurify usage
- `backend/src/routes/blogs.ts`
- `frontend/src/config/metaTags.ts`

#### Interview Talking Point
> *"Blog content is stored as HTML because admins write formatted posts. Before rendering, DOMPurify strips any script tags or event handlers — this prevents XSS attacks where malicious JavaScript could be injected into a blog post and executed in readers' browsers."*

---

## 4. Technical Concepts Glossary

> These are the real concepts behind the code. Understand these to speak fluently in technical interviews.

---

### REST API

**What it is (simple):** A set of rules for how a client (browser) and server communicate over HTTP. Each URL + HTTP method combination does one thing.

**Where we used it:** Every backend route — `GET /api/resumes` gets all resumes, `POST /api/resumes` creates one, `DELETE /api/resumes/:id` deletes a specific one.

**Why it mattered:** REST gives the frontend and backend a predictable contract. The frontend knows exactly what URL to call and what JSON shape to expect back.

**What to read:** [REST API Tutorial](https://restfulapi.net/) | [MDN HTTP Methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)

---

### JWT (JSON Web Token)

**What it is (simple):** A digitally signed string that proves who you are. Like a wristband at a concert — you get it at the door (login), and every subsequent request shows it to prove you're a valid attendee.

**Where we used it:** Supabase Auth issues JWTs on login. Every protected API call sends `Authorization: Bearer <token>` in the header. The backend middleware verifies the token with Supabase before processing the request.

**Why it mattered:** Stateless authentication — the server doesn't store sessions. Every request is self-contained and verifiable.

**What to read:** [jwt.io Introduction](https://jwt.io/introduction)

---

### Middleware (Express)

**What it is (simple):** Functions that run between the incoming HTTP request and your route handler. Like airport security checkpoints — every passenger (request) passes through them before reaching the gate (route).

**Where we used it:** `authenticateUser` middleware runs on every protected route. `validateRequest(schema)` runs before handlers to reject malformed input. Rate limiting runs on all routes.

**Why it mattered:** Middleware lets you apply cross-cutting concerns (auth, logging, validation) without repeating code in every route.

**Code location:** `backend/src/middleware/` — 9 middleware files

---

### Row-Level Security (RLS)

**What it is (simple):** Database-level access control. PostgreSQL checks if a query is allowed based on a policy — e.g. "users can only SELECT rows where `user_id` matches their auth token."

**Where we used it:** Every Supabase table (`resumes`, `applications`, `subscriptions`, etc.) has RLS policies. Even if the backend sends a bug query, the database rejects it.

**Why it mattered:** Defence in depth. Application bugs can't leak other users' data.

---

### TypeScript Interfaces

**What it is (simple):** A contract that defines the shape of an object. If code tries to use a property that doesn't exist on the interface, TypeScript catches it at compile time — before the app runs.

**Where we used it:** `frontend/types.ts` contains 50+ interfaces — `ResumeData`, `SkillGapResult`, `SelectionCriterion`, etc. Both frontend and backend share these definitions.

**Why it mattered:** Prevents the #1 source of runtime bugs in JavaScript: accessing `.field` on an object where `.field` doesn't exist. When Gemini returns a JSON response, TypeScript ensures it matches the expected interface.

---

### Structured JSON Output (Gemini responseSchema)

**What it is (simple):** When you call a language model, it normally returns free-form text. Structured output forces the model to return JSON that matches a specific schema — like making someone fill in a form instead of writing an essay.

**Where we used it:** `analyze-resume`, `skill-gap-analysis`, `selection-criteria` endpoints all pass a `responseSchema` and `responseMimeType: 'application/json'` to Gemini. This guarantees the AI returns data that TypeScript can safely parse.

**Why it mattered:** Without this, you'd have to use regex or brittle string parsing to extract data from LLM output — fragile and error-prone.

**Code location:** `backend/src/routes/gemini.ts` — `responseSchema` objects in each handler

---

### Prompt Engineering

**What it is (simple):** The craft of writing instructions to an AI model that reliably produce the output you want. Unlike code, which is deterministic, prompts require iterative testing to get consistent results.

**Where we used it:** Every Gemini endpoint has a prompt you (the product owner) designed. For example, the skill gap prompt must instruct the model to: classify skills by type (technical/soft/certification), rate strength (strong/moderate/mentioned), and assign priority (critical/important/nice-to-have) — all as structured output.

**Why it mattered:** A bad prompt produces inconsistent, unusable AI output. A well-engineered prompt with schema enforcement produces data you can render directly in a UI.

---

### React Context API

**What it is (simple):** A way to share state (data) with any component in your React app without passing it through props at every level. Like a global variable that React components can subscribe to.

**Where we used it:** `AuthContext` — stores the current user, loading state, login/logout functions. Every component that needs auth data calls `useAuth()` to get it.

**Why it mattered:** Without context, you'd have to pass `user` as a prop through every component in the tree — "prop drilling" becomes unmanageable.

**Code location:** `frontend/src/contexts/AuthContext.tsx`

---

### Lazy Loading (Code Splitting)

**What it is (simple):** Instead of loading all JavaScript at once when the app starts, lazy loading splits the code into chunks. Each page/component only downloads when the user navigates to it.

**Where we used it:** `frontend/App.tsx` — every heavy component is wrapped in `const Component = lazy(() => import('./components/Component'))`. Vite creates separate JS bundles for each.

**Why it mattered:** Reduces initial page load time. A user who only visits the landing page doesn't download the Resume Builder code.

---

### Webhook (Stripe)

**What it is (simple):** Instead of your app asking Stripe "did the payment succeed?" every few seconds (polling), Stripe proactively sends HTTP POST requests to your server when events happen. Your server listens and reacts.

**Where we used it:** `backend/src/routes/webhooks.ts` — listens for Stripe events like `checkout.session.completed`. When a payment succeeds, it updates the user's subscription in Supabase.

**Why it mattered:** Webhooks are the only reliable way to sync payment state. If a user pays but closes their browser before being redirected, polling would miss it. Webhooks always fire.

---

### JSONB (PostgreSQL)

**What it is (simple):** A PostgreSQL column type that stores JSON data in a binary format optimised for querying. Like storing a whole JavaScript object in one database cell.

**Where we used it:** The `resumes.data` column stores the entire `ResumeData` object as JSONB — all personal details, all experience entries, all skills, in one column.

**Why it mattered:** Resume data is variable-length and nested. A normalised schema (one row per experience entry) would require 5+ joins to reconstruct a resume. JSONB retrieves it in one query.

---

### Rate Limiting

**What it is (simple):** A mechanism that caps how many requests an IP address or user can make in a time window. Like a bouncer limiting how many times you can enter a club per hour.

**Where we used it:** `backend/src/middleware/rateLimiting.ts` — different limits per endpoint type: auth (10/15min), AI endpoints (500/hour), payments (10/hour), general (100/15min).

**Why it mattered:** Prevents abuse — someone can't write a script that calls `/api/gemini/analyze-resume` 10,000 times and run up your Gemini API bill.

---

### Input Validation (Joi)

**What it is (simple):** Before your route handler runs, validate that the incoming data is what you expect — right types, right format, within length limits. Reject anything that doesn't match.

**Where we used it:** `backend/src/validators/schemas.ts` — 12+ Joi schemas. Every POST/PUT route runs `validateRequest(schema)` middleware before the handler.

**Why it mattered:** Without validation, malicious users can send unexpected data types that cause crashes or SQL injection vulnerabilities.

---

### SPA (Single Page Application)

**What it is (simple):** The browser downloads one HTML file and one JavaScript bundle. Navigation between "pages" happens in JavaScript without full page reloads — React Router intercepts clicks and swaps components.

**Where we used it:** CareerHub AI's frontend is a Vite-built SPA. `frontend/vercel.json` rewrites all URLs to `index.html` so React Router handles routing, not the server.

**Why it mattered:** Faster navigation (no full page reload), smoother UX, but requires explicit handling of deep links (the server must always serve `index.html`).

---

### Serverless Functions (Vercel)

**What it is (simple):** Instead of running a permanent backend server 24/7, your backend code runs only when a request arrives. Vercel manages the server infrastructure — you just deploy code.

**Where we used it:** The Express backend is deployed as a Vercel serverless function via `backend/vercel.json`. Each request to `/api/*` spins up a function instance.

**Why it mattered:** No server management, scales automatically, pay per request instead of per-hour server cost.

---

## 5. Debugging & Iteration Log

### Situation 1: Stripe Webhook Signature Verification Failed

**What broke:** The Stripe webhook endpoint returned 400 errors. Stripe events weren't updating subscription status in the database.

**The problem:** Express's `express.json()` body parser was consuming the raw HTTP body before the webhook route could verify Stripe's HMAC signature. The signature is calculated on the raw bytes — once parsed to JSON, verification always fails.

**What I had to do:** Re-prompt Claude Code to move the Stripe webhook route registration in `app.ts` to BEFORE the JSON body parser middleware, with `express.raw({ type: 'application/json' })` applied specifically to that route.

**What I learned:** Middleware order in Express is not just an organisational choice — it determines what data each handler receives. The sequence matters critically.

---

### Situation 2: Gemini Returning Malformed JSON for Selection Criteria

**What broke:** The selection criteria endpoint worked in testing but threw parsing errors in production for certain job descriptions. The TypeScript interface was throwing at runtime.

**The problem:** Without a strict `responseSchema`, Gemini occasionally returned extra fields or nested objects in a different structure than expected.

**What I had to do:** Added explicit `responseSchema` and `responseMimeType: 'application/json'` to the Gemini call — forcing schema-compliant output. Also added try/catch around the JSON.parse with a user-friendly error message.

**What I learned:** LLMs are non-deterministic. For structured data use cases, always enforce output schemas — never assume the model will "just format it correctly."

---

### Situation 3: Free Users Bypassing Usage Limits

**What broke:** During testing, free users were able to make more than 3 AI analysis calls if they timed their requests simultaneously (race condition).

**The problem:** The limit check (`resume_analyses_done < 3`) and the counter increment (`resume_analyses_done + 1`) were two separate database operations with a gap between them.

**What I had to do:** Redesigned the counter update to use a conditional update — only increment if the current count is below the limit, and check the result to confirm the update happened (row was affected).

**What I learned:** Any "check then act" pattern across two database operations has a race condition. Use atomic database operations (conditional updates) for anything involving counters or limits.

---

### Situation 4: Supabase RLS Blocking Admin Queries

**What broke:** The admin blog management endpoints were returning empty arrays even though data existed in the database.

**The problem:** Admin routes were using the frontend's anonymous Supabase client (which enforces RLS). The admin operations needed the service-role client (which bypasses RLS).

**What I had to do:** Verified that all backend routes import from `backend/src/config/supabase.ts` (service key), not `frontend/src/config/supabase.ts` (anon key). Added documentation to `CLAUDE.md` clarifying the two different clients.

**What I learned:** Supabase has two clients with fundamentally different security levels. The service key never belongs in frontend code, and the anon key never belongs in backend code that needs admin access.

---

### Situation 5: React Strict Mode Causing Double AI API Calls

**What broke:** In development, every AI call was being made twice — doubling costs and causing confusing duplicate responses.

**The problem:** React 19's Strict Mode deliberately runs effects twice in development to detect side effects. The `useEffect` that triggered AI calls ran twice on mount.

**What I had to do:** Implemented request deduplication in `geminiService.ts` using an in-flight tracking Map — if the same request is already in progress, return the existing Promise instead of making a new API call.

**What I learned:** React Strict Mode exists for a reason (it catches real bugs). Never disable it as a shortcut. Instead, design services to be idempotent and handle duplicate calls gracefully.

---

## 6. JavaScript/TypeScript & Node.js Knowledge Required

> The CareerHub AI backend is **TypeScript on Node.js** (not Python). This section covers what you actually need to know.

### What You Must Understand (Core to This Project)

| Concept | Where It's Used | Why It Matters |
|---------|-----------------|---------------|
| **async/await** | Every route handler, every service function | All database and API calls are asynchronous |
| **Promises** | `geminiService.ts`, all service functions | Understanding `Promise<T>` types and error propagation |
| **TypeScript interfaces** | `frontend/types.ts` — 50+ interfaces | Defines all data shapes; type safety across the app |
| **TypeScript generics** | `Promise<ResumeData>`, `Promise<SkillGapResult>` | Functions that work with multiple typed return values |
| **HTTP/fetch API** | All frontend service functions | How the browser makes API calls |
| **JSON serialisation** | `.json()` on responses, `JSON.parse()`, `JSON.stringify()` | Data format between frontend and backend |
| **Express routing** | All 12 route files | How URL patterns map to handler functions |
| **Destructuring** | `const { data, error } = await supabase...` | JavaScript shorthand used throughout |
| **Arrow functions** | Everywhere (`async (req, res) => { ... }`) | Standard modern JS syntax |
| **Array methods** | `.map()`, `.filter()`, `.find()` in components | Rendering lists, transforming data |
| **Module imports/exports** | Every file | How code is organised and shared between files |
| **try/catch** | Every route handler | Error handling pattern |

### What You Should Understand Well (Used Frequently)

| Concept | Where It's Used |
|---------|-----------------|
| **React hooks** (`useState`, `useEffect`, `useContext`) | Every functional component |
| **React Context** | `AuthContext.tsx` — global auth state |
| **TypeScript union types** | `Plan = 'free' \| 'weekly' \| 'monthly'` |
| **TypeScript enums/literals** | `SkillPriority = 'critical' \| 'important' \| 'nice-to-have'` |
| **Optional chaining** | `req.user?.id`, `subscription?.plan` |
| **Template literals** | SQL queries, prompt strings |
| **Middleware pattern** | How Express processes requests through a chain of functions |

### What You Don't Need to Know Deeply (Handled by Frameworks)

| Concept | Why You Can Skip It |
|---------|---------------------|
| **Raw SQL** | Supabase SDK generates the SQL; you write `supabase.from('table').select('*')` |
| **TCP/HTTP internals** | Express abstracts the raw HTTP layer |
| **JWT cryptography** | Supabase handles signing/verification |
| **OAuth flows** | Supabase handles the Google OAuth redirect dance |
| **Stripe payment processing** | Stripe's SDK and hosted Checkout handle PCI compliance |
| **CSS layout algorithms** | TailwindCSS utility classes abstract flexbox/grid |

### Python Note

> The CareerHub AI backend is **TypeScript/Node.js — not Python**. If an interviewer asks about Python, be direct:
> *"This project's backend is Node.js with TypeScript and Express — the same language as the frontend. This was a deliberate choice for code sharing and team coherence."*
> You do not need Python knowledge to explain or maintain this project.

---

## 7. Recommended 2-Week Learning Path

> Goal: Be able to confidently explain every technical decision in CareerHub AI. Not to re-implement it — to understand it.

---

### Week 1: Foundations

**Day 1–2: TypeScript Fundamentals**
- Focus: interfaces, types, async/await, generics
- Practice: Open `frontend/types.ts` and `frontend/services/geminiService.ts` and trace the types from function call to return value
- Resource: [TypeScript Official Handbook — The Basics](https://www.typescriptlang.org/docs/handbook/2/basic-types.html)

**Day 3: REST APIs & Express**
- Focus: HTTP methods, route handlers, middleware, req/res objects
- Practice: Read `backend/src/routes/resumes.ts` and trace one request from HTTP call → middleware → handler → database → response
- Resource: [Express.js Getting Started](https://expressjs.com/en/starter/hello-world.html)

**Day 4: Authentication with JWTs**
- Focus: What a JWT is, how it's verified, stateless auth
- Practice: Read `backend/src/middleware/auth.ts` — understand each line
- Resource: [jwt.io Introduction](https://jwt.io/introduction)

**Day 5: React Hooks & Context**
- Focus: `useState`, `useEffect`, `useContext`
- Practice: Read `frontend/src/contexts/AuthContext.tsx` — understand how login state flows to every component
- Resource: [React Docs — Hooks Reference](https://react.dev/reference/react/hooks)

**Day 6–7: Supabase & PostgreSQL Basics**
- Focus: What RLS does, how JSONB works, Supabase query syntax
- Practice: Read `backend/src/services/database.ts` — understand `resumeDb` and `subscriptionDb`
- Resource: [Supabase Docs — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)

---

### Week 2: Advanced Concepts

**Day 8: Prompt Engineering**
- Focus: How to structure prompts for consistent AI output; few-shot vs. zero-shot; system vs. user messages
- Practice: Open `backend/src/routes/gemini.ts` and read the prompts for `skill-gap-analysis` and `selection-criteria` — map each instruction to the output schema
- Resource: [Google Prompting Guide 101](https://ai.google.dev/gemini-api/docs/prompting-strategies)

**Day 9: Structured JSON Output from LLMs**
- Focus: Why `responseSchema` matters; how Gemini schema enforcement works
- Practice: Find the `responseSchema` object in the `selection-criteria` endpoint and map each field to the `SelectionCriteriaResult` TypeScript interface
- Resource: [Gemini Controlled Generation Docs](https://ai.google.dev/gemini-api/docs/structured-output)

**Day 10: Stripe Payments & Webhooks**
- Focus: How Checkout Sessions work, why webhooks exist, HMAC signature verification
- Practice: Read `backend/src/routes/webhooks.ts` and `backend/src/routes/payments.ts` — trace a successful payment from button click to subscription update
- Resource: [Stripe Docs — How Webhooks Work](https://stripe.com/docs/webhooks)

**Day 11: Input Validation & Security**
- Focus: Why validate input, what injection attacks look like, how Joi schemas work
- Practice: Read `backend/src/validators/schemas.ts` — pick two schemas and understand every constraint
- Resource: [OWASP Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)

**Day 12: SPA Architecture & Deployment**
- Focus: How Vite builds the SPA, what Vercel's `rewrites` config does, why serverless functions work differently from a persistent server
- Practice: Read `frontend/vercel.json` and `backend/vercel.json` — understand why both exist and what each does
- Resource: [Vercel Docs — Serverless Functions](https://vercel.com/docs/functions/serverless-functions)

**Day 13: Practice Interview Answers**
- Using this document, write 2–3 sentence answers for each Feature's "Interview Talking Point"
- Practice explaining the full architecture from: "User clicks Analyse Resume" → browser → API → Gemini → response → UI render
- Record yourself explaining the tech stack summary (Section 1) in under 2 minutes

**Day 14: Mock Technical Interview**
- Ask a friend (or use an AI) to ask you: "Walk me through the CareerHub AI architecture", "How does your authentication work?", "What was the hardest technical challenge?", "What AI techniques did you use?"
- Use the exact terminology from this document — not vague descriptions

---

### Interview Readiness Checklist

Before your interview, you should be able to answer these without hesitation:

- [ ] What is the tech stack and why was each piece chosen?
- [ ] How does a user's JWT get created and verified on every API request?
- [ ] Why does the Stripe webhook route go before the JSON body parser?
- [ ] What is Row-Level Security and why does CareerHub AI use it?
- [ ] What is the difference between `gemini-2.5-flash` and `gemini-2.5-pro` and where is each used?
- [ ] Why is `responseSchema` critical for the Skill Gap and Selection Criteria features?
- [ ] What is JSONB and why store resumes that way instead of normalised tables?
- [ ] How do usage limits work — trace from "user clicks Analyse" to "counter incremented"?
- [ ] What was the race condition in the usage limiter and how was it fixed?
- [ ] What is lazy loading and why does CareerHub AI use it?
- [ ] How did you design the STAR-method output for selection criteria?
- [ ] What's the difference between the Supabase service key and anon key?
- [ ] How does the Expert Review order lifecycle work — what are the 7 statuses and who triggers each transition?
- [ ] Why does Expert Review use Stripe `mode: 'payment'` instead of `mode: 'subscription'`?
- [ ] Why is file upload sent as raw binary (not multipart form) and what header carries the filename?
- [ ] How does Supabase Storage fit into the architecture — what does it store that the database doesn't?
- [ ] Why does Expert Review use signed URLs for file downloads instead of public URLs?

---

## 8. Feature 12: Expert Resume Review (Added 2026-03-05)

### What It Is

A premium human-powered service ($89 one-time purchase) where a real expert rewrites the user's resume. Unlike the AI features, this is a **managed workflow** — a multi-step, state-machine process involving payment, file uploads, a questionnaire exchange, and final delivery. No AI is involved in the review itself.

---

### What I Designed/Configured

- **Business model decision:** One-time Stripe payment (not recurring subscription) at $89 — completely separate from the weekly/monthly subscription plans
- **Workflow design:** Designed the 7-step order lifecycle: `pending_submission → submitted → in_review → questionnaire_sent → questionnaire_completed → revision_in_progress → completed`
- **Questionnaire system:** Designed the admin-sends-questions / user-answers flow so the expert can gather context before rewriting
- **Admin operational tooling:** Decided the admin needs a dedicated panel to manage orders, view original resumes, upload rewrites, and send questionnaires
- **Storage strategy:** Decided to use Supabase Storage (private bucket `expert-reviews`) for PDF files rather than storing binary data in PostgreSQL
- **Email notification design:** Specified 5 transactional email touchpoints to keep both the user and admin informed at each stage
- **Pricing iteration:** Started at $99, changed to $89 based on positioning review

---

### What Claude Code Implemented

| Layer | Files | Purpose |
|-------|-------|---------|
| Database | `backend/migrations/010_create_expert_reviews_table.sql` | `expert_reviews` table with status check constraint, JSONB questionnaire fields, RLS policies, storage bucket instructions |
| Backend routes | `backend/src/routes/expertReview.ts` | 12 endpoints — 6 user-facing, 6 admin-only |
| Database service | `expertReviewDb` in `backend/src/services/database.ts` | `getById`, `getByUserId`, `getActiveByUserId`, `getAll`, `create`, `update` |
| Frontend component | `frontend/components/ExpertReviewPage.tsx` | User-facing page: purchase, upload resume, questionnaire, download |
| Frontend component | `frontend/components/ExpertReviewAdmin.tsx` | Admin panel: order list, status management, file up/download, questionnaire tools |
| Frontend component | `frontend/components/ExpertReviewWidget.tsx` | Embedded CTA widget shown on Dashboard and other pages |
| Frontend service | `frontend/services/expertReviewService.ts` | All API calls (user + admin functions) |
| TypeScript types | `frontend/types.ts` | `ExpertReview`, `ExpertReviewStatus`, `QuestionnaireQuestion`, `QuestionnaireAnswer` interfaces |
| Stripe config | `backend/src/config/stripe.ts` | `STRIPE_PRICE_IDS.EXPERT_REVIEW` added |
| Webhooks | `backend/src/routes/webhooks.ts` | Handles `checkout.session.completed` for `type: 'expert_review'` — creates the `expert_reviews` DB row on payment success |
| Emails | `backend/src/services/emailService.ts` | 5 new email functions: confirmation, resume submitted, questionnaire ready, questionnaire completed, rewrite ready |
| Pricing page | `frontend/src/components/payments/PricingPage.tsx` | Expert Review banner/CTA added |

---

### The 7-Status Order Lifecycle

```
Payment succeeds (Stripe webhook)
         │
         ▼
  pending_submission        ← DB row created by webhook; user notified to upload resume
         │
         │  User uploads PDF via POST /submit-resume
         ▼
      submitted             ← Admin notified by email
         │
         │  Admin begins reviewing (manual status update via admin panel)
         ▼
      in_review
         │
         │  Admin writes questions → POST /admin/:id/questionnaire
         ▼
  questionnaire_sent        ← User notified by email to answer
         │
         │  User submits answers → POST /questionnaire/:id
         ▼
questionnaire_completed     ← Admin notified by email
         │
         │  Admin manually sets status
         ▼
revision_in_progress        ← Expert actively rewriting
         │
         │  Admin uploads PDF → POST /admin/:id/upload-rewrite
         ▼
      completed             ← User notified; can download via GET /download/:id
```

**Who triggers each transition:**
- `pending_submission` → `submitted`: **User** (uploads resume PDF)
- `submitted` → `in_review`: **Admin** (manual, marks they've started)
- `in_review` → `questionnaire_sent`: **Admin** (posts questions; email fires automatically)
- `questionnaire_sent` → `questionnaire_completed`: **User** (submits answers; email fires automatically)
- `questionnaire_completed` → `revision_in_progress`: **Admin** (manual)
- `revision_in_progress` → `completed`: **Admin** (uploads rewritten PDF; email fires automatically)

---

### Key Technical Decisions & Why

| Decision | Rationale |
|----------|-----------|
| **Stripe `mode: 'payment'`** (not `'subscription'`) | This is a one-time purchase. The subscription checkout uses `mode: 'subscription'`. Using the wrong mode would fail or create an unwanted recurring charge. |
| **File upload as raw binary body** (not multipart form) | Simpler to pipe directly to Supabase Storage upload. The filename is carried in `X-Filename` HTTP header. Requires `express.raw()` middleware on those two routes. |
| **Supabase Storage private bucket** (not public) | Resume PDFs are sensitive personal documents — they must never be publicly accessible. Users get time-limited signed URLs (1-hour expiry) to download their file. |
| **Signed URLs for downloads** | `createSignedUrl(path, 3600)` generates a URL that expires in 1 hour. Even if someone intercepts the URL, it stops working after the window closes. |
| **JSONB for questionnaire fields** | The number and content of questions varies per order (the expert customises them). JSONB allows storing `[{question, type}]` and `[{question, answer}]` arrays without a separate questions table. |
| **Webhook creates the DB row** (not the checkout endpoint) | The checkout endpoint only creates a Stripe session and returns the URL. The actual `expert_reviews` row is created when the webhook confirms payment succeeded — preventing records being created for abandoned checkouts. |
| **Duplicate purchase prevention** | `getActiveByUserId()` checks for an existing non-completed review before creating a checkout. Returns 400 with the active `reviewId` so the frontend can redirect to the existing order instead. |
| **User identity snapshot in DB** | `user_email` and `user_name` are stored on the `expert_reviews` row at creation time. This means admin emails always have the correct contact details even if the user later changes their account email. |

---

### API Endpoints Summary

**User endpoints** (all require auth):
```
POST /api/expert-review/create-checkout         → Start Stripe Checkout ($89 one-time)
GET  /api/expert-review/status                  → Get all reviews for current user
POST /api/expert-review/submit-resume           → Upload original resume PDF (raw binary)
GET  /api/expert-review/questionnaire/:reviewId → Get questionnaire from expert
POST /api/expert-review/questionnaire/:reviewId → Submit answers
GET  /api/expert-review/download/:reviewId      → Get signed URL for rewritten resume PDF
```

**Admin endpoints** (require auth + admin role):
```
GET  /api/expert-review/admin/orders             → List all orders (filterable by status)
GET  /api/expert-review/admin/:id                → Get full order details
PUT  /api/expert-review/admin/:id/status         → Update status + admin notes
POST /api/expert-review/admin/:id/questionnaire  → Set questions + notify user
POST /api/expert-review/admin/:id/upload-rewrite → Upload rewritten PDF + notify user
GET  /api/expert-review/admin/:id/download-original → Get signed URL for original PDF
GET  /api/expert-review/admin/:id/answers        → View user's questionnaire answers
```

---

### New TypeScript Interfaces Added (`frontend/types.ts`)

```typescript
export type ExpertReviewStatus =
  | 'pending_submission'
  | 'submitted'
  | 'in_review'
  | 'questionnaire_sent'
  | 'questionnaire_completed'
  | 'revision_in_progress'
  | 'completed';

export interface QuestionnaireQuestion {
  question: string;
  type: 'text' | 'textarea';
}

export interface QuestionnaireAnswer {
  question: string;
  answer: string;
}

export interface ExpertReview {
  id: string;
  user_id: string;
  status: ExpertReviewStatus;
  stripe_payment_intent_id?: string;
  amount_paid?: number;        // stored in cents (8900 = $89.00)
  paid_at?: string;
  original_resume_url?: string;
  original_resume_filename?: string;
  submitted_at?: string;
  questionnaire?: QuestionnaireQuestion[];
  questionnaire_answers?: QuestionnaireAnswer[];
  questionnaire_sent_at?: string;
  questionnaire_completed_at?: string;
  rewritten_resume_url?: string;
  rewritten_resume_filename?: string;
  completed_at?: string;
  admin_notes?: string;
  user_email?: string;
  user_name?: string;
  created_at: string;
  updated_at: string;
}
```

---

### New Database Table (`expert_reviews`)

Key design notes:
- `status` column has a **PostgreSQL CHECK constraint** — the database itself rejects invalid status values, not just application code
- `questionnaire` and `questionnaire_answers` are **JSONB** — flexible, no separate tables needed
- `amount_paid` stored in **cents** (integer), not dollars — avoids floating-point precision bugs in financial data
- **RLS policies** allow users to SELECT and UPDATE their own rows; INSERT and admin operations use the service key (bypass RLS)
- **Private Supabase Storage bucket** (`expert-reviews`) — not accessible without a signed URL

---

### New Email Notifications (`emailService.ts`)

| Function | Trigger | Recipient |
|----------|---------|-----------|
| `sendExpertReviewConfirmation()` | Payment webhook succeeds | User |
| `sendResumeSubmittedNotification()` | User uploads resume | Admin |
| `sendQuestionnaireReady()` | Admin sends questions | User |
| `sendQuestionnaireCompletedNotification()` | User submits answers | Admin |
| `sendRewrittenResumeReady()` | Admin uploads rewritten PDF | User |

---

### Interview Talking Points

> *"Expert Review is the only non-AI feature in CareerHub AI — a human-powered service. The interesting technical challenge was designing a reliable order lifecycle with 7 states, where each transition triggers a different email and a different set of available actions for both the user and the admin. I used a PostgreSQL CHECK constraint on the status column so invalid state values are rejected at the database level, not just in application code."*

> *"I designed the payment flow so the database record is only created when the Stripe webhook confirms payment success — not when the user clicks 'Pay'. This prevents ghost orders from abandoned checkouts. The checkout endpoint only returns a session URL; the webhook is the source of truth."*

> *"File uploads bypass Express's JSON body parser — they use `express.raw()` and stream the binary directly to Supabase Storage. Files are stored in a private bucket and served through signed URLs with 1-hour expiry. This is important for resume PDFs which contain sensitive personal information."*

---

*Guide version: 1.1 | Expert Review feature added 2026-03-05 | CareerHub AI v1.2*
