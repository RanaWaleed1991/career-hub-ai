# Production Deployment Guide

## Overview

This guide explains how to deploy Career Hub AI to production using the new production Supabase database.

**Key Principle**: Keep development and production environments completely separate using different `.env` files.

---

## Environment Files Structure

```
career-hub-ai/
├── backend/
│   ├── .env                    # Development (local testing)
│   ├── .env.production         # Production (real users) - NOT COMMITTED
│   └── .env.production.example # Template - SAFE TO COMMIT
├── frontend/
│   ├── .env                    # Development (local testing)
│   ├── .env.production         # Production (real users) - NOT COMMITTED
│   └── .env.production.example # Template - SAFE TO COMMIT
└── .gitignore                  # Excludes .env.production files
```

---

## Step 1: Create Production Environment Files

### Backend Production Config

1. Copy the example file:
   ```bash
   cd backend
   cp .env.production.example .env.production
   ```

2. Edit `backend/.env.production` with your production values:
   ```bash
   # Server Configuration
   NODE_ENV=production
   PORT=3001
   CLIENT_URL=https://your-production-domain.com

   # Supabase (NEW PRODUCTION PROJECT)
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-new-production-service-role-key
   SUPABASE_ANON_KEY=your-new-production-anon-key

   # Stripe (LIVE KEYS - sk_live_... not sk_test_...)
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_PUBLISHABLE_KEY=pk_live_...

   # Adzuna API
   ADZUNA_APP_ID=your-app-id
   ADZUNA_API_KEY=your-api-key

   # Google Gemini AI
   GEMINI_API_KEY=your-gemini-api-key
   ```

### Frontend Production Config

1. Copy the example file:
   ```bash
   cd frontend
   cp .env.production.example .env.production
   ```

2. Edit `frontend/.env.production` with your production values:
   ```bash
   # Supabase (NEW PRODUCTION PROJECT)
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=your-new-production-anon-key

   # Stripe (LIVE KEY - pk_live_... not pk_test_...)
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

   # API
   VITE_API_URL=https://your-production-api-domain.com/api
   ```

---

## Step 2: How Environment Files Work

### Development Mode (Local Testing)

```bash
# Backend - Uses .env
cd backend
npm run dev

# Frontend - Uses .env
cd frontend
npm run dev
```

**Loads**: `.env` files (old/dev Supabase, Stripe test keys)

### Production Mode (Real Users)

```bash
# Backend - Uses .env.production
cd backend
npm run build
npm run start:prod

# Frontend - Uses .env.production
cd frontend
npm run build
```

**Loads**: `.env.production` files (new prod Supabase, Stripe live keys)

---

## Step 3: Build and Deploy

### Backend Deployment

```bash
cd backend

# 1. Install dependencies
npm install

# 2. Build TypeScript to JavaScript
npm run build

# 3. Start in production mode (uses .env.production)
npm run start:prod
```

**What happens**:
- `npm run build` → Compiles TypeScript to `dist/` folder
- `npm run start:prod` → Sets `NODE_ENV=production` and runs `node dist/server.js`
- Backend reads `backend/.env.production` (NEW Supabase, Stripe LIVE keys)

### Frontend Deployment

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Build for production (uses .env.production automatically)
npm run build
```

**What happens**:
- Vite automatically uses `.env.production` when building
- Creates optimized production bundle in `dist/` folder
- Bundle includes NEW Supabase URL and Stripe LIVE publishable key
- Ready to deploy to hosting service (Vercel, Netlify, etc.)

---

## Step 4: Verify Production Configuration

### Backend Verification

Start the backend and check the logs:

```bash
cd backend
npm run start:prod
```

You should see:
```
[Info] Environment: production
[Info] Using environment file: .env.production
[Info] Connected to Supabase: https://your-new-production-project.supabase.co
```

### Frontend Verification

After building, check the console:

```bash
cd frontend
npm run build
```

Look for:
```
✓ built in 3.45s
✓ 15 modules transformed.
```

Then check the built files:
```bash
grep -r "your-new-production-project" dist/
```

Should show your NEW production Supabase URL embedded in the bundle.

---

## Step 5: Deployment Platforms

### Option 1: Vercel (Recommended for Frontend)

**Frontend**:
```bash
cd frontend
vercel --prod
```

**Environment Variables**: Set in Vercel dashboard under Settings → Environment Variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `VITE_API_URL`

### Option 2: Railway (Recommended for Backend)

**Backend**:
1. Connect your GitHub repo to Railway
2. Set environment variables in Railway dashboard (same as `.env.production`)
3. Set start command: `npm run start:prod`

### Option 3: Traditional VPS (DigitalOcean, AWS, etc.)

**Backend**:
```bash
# On your server
git clone your-repo
cd career-hub-ai/backend
cp .env.production.example .env.production
# Edit .env.production with your values
npm install
npm run build
npm run start:prod
```

**Frontend** (Nginx example):
```bash
# Build locally or on server
cd frontend
npm run build

# Copy dist/ to nginx web root
sudo cp -r dist/* /var/www/html/
```

---

## Step 6: Environment Comparison

| Feature | Development (.env) | Production (.env.production) |
|---------|-------------------|------------------------------|
| **Supabase** | Old/dev project | NEW production project |
| **Stripe** | Test keys (sk_test_) | Live keys (sk_live_) |
| **Rate Limiting** | Disabled | Enabled |
| **Compression** | Enabled | Enabled |
| **Caching** | Enabled | Enabled |
| **Domain** | localhost:5173 | your-domain.com |
| **API URL** | localhost:3001 | api.your-domain.com |

---

## Step 7: Post-Deployment Checklist

After deploying:

- [ ] Test user registration (should auto-create free subscription)
- [ ] Test user login
- [ ] Test resume creation and download
- [ ] Test job browsing
- [ ] Test course browsing
- [ ] Test Stripe payment flow (with test card first!)
- [ ] Verify data is being stored in NEW production Supabase
- [ ] Check backend logs for errors
- [ ] Test mobile responsiveness
- [ ] Run Lighthouse performance audit

---

## Troubleshooting

### Issue: App still connects to old Supabase

**Solution**:
- Verify `.env.production` files exist in both `backend/` and `frontend/`
- Make sure you're using `npm run start:prod` for backend (not `npm start`)
- Clear frontend build cache: `rm -rf frontend/dist` then rebuild

### Issue: Stripe payment fails

**Cause**: Using test keys in production or vice versa

**Solution**:
- Production must use `sk_live_...` and `pk_live_...` keys
- Development uses `sk_test_...` and `pk_test_...` keys
- Never mix test and live keys

### Issue: CORS errors in production

**Solution**:
- Update `CLIENT_URL` in `backend/.env.production` to match your frontend domain
- Update `VITE_API_URL` in `frontend/.env.production` to match your backend domain

---

## Security Best Practices

### ✅ DO:

- Keep `.env` for development, `.env.production` for production
- Use different Supabase projects for dev and prod
- Use Stripe test keys in development
- Use Stripe live keys in production
- Add `.env.production` to `.gitignore` (already done)
- Commit `.env.production.example` as a template
- Rotate production secrets regularly

### ❌ DON'T:

- Commit `.env` or `.env.production` to git
- Use production database for local development
- Use test Stripe keys in production
- Share production secrets in Slack/email
- Hardcode secrets in source code

---

## Summary

**Development Workflow**:
```bash
# Keep using .env for local development
npm run dev  # Backend uses .env
npm run dev  # Frontend uses .env
```

**Production Deployment**:
```bash
# Create .env.production files (one time setup)
cp .env.production.example .env.production
# Edit with production values

# Build and deploy
npm run build          # Frontend uses .env.production automatically
npm run start:prod     # Backend uses .env.production
```

**The Benefit**:
- ✅ Development and production completely isolated
- ✅ Can test locally without affecting production
- ✅ Easy to switch between environments
- ✅ Team members can develop safely
- ✅ Production secrets stay secure

---

## Quick Reference

| Action | Command | Uses |
|--------|---------|------|
| Local dev (backend) | `npm run dev` | `.env` |
| Local dev (frontend) | `npm run dev` | `.env` |
| Build backend | `npm run build` | N/A |
| Run backend prod | `npm run start:prod` | `.env.production` |
| Build frontend prod | `npm run build` | `.env.production` |

---

**Questions?** Check the migration was successful:
```sql
-- Run in NEW production Supabase SQL Editor
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected tables: `applications`, `course_enrollments`, `courses`, `jobs`, `resumes`, `resume_versions`, `subscriptions`

All set? Your app is production-ready! 🚀
