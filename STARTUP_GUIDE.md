# Career Hub AI - Complete Startup Guide

## Quick Start (After Fresh Clone or First Time Setup)

### 1. Database Setup (ONE TIME ONLY)

**Step 1.1: Apply Database Schema**
1. Open your **Supabase Dashboard** → **SQL Editor**
2. Copy and paste the entire contents of `database_schema.sql`
3. Click **Run**

**Step 1.2: Reload Schema Cache** (CRITICAL!)
In the same SQL Editor, run:
```sql
NOTIFY pgrst, 'reload schema';
```

This fixes the `PGRST204` error about `version_name` column not found.

**Step 1.3: Verify Schema**
Run this to confirm tables exist:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

You should see: `applications`, `resumes`, `resume_versions`, `subscriptions`

---

### 2. Backend Setup

**Step 2.1: Install Dependencies**
```bash
cd backend
npm install
```

**Step 2.2: Configure Environment**
Create `.env` file in `backend/` directory:
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key

# Server Configuration
PORT=3001
```

**Step 2.3: Build Backend**
```bash
npm run build
```

**Step 2.4: Start Backend**
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The backend should start on `http://localhost:3001`

---

### 3. Frontend Setup

**Step 3.1: Install Dependencies**
```bash
cd frontend
npm install
```

**Step 3.2: Configure Environment**
Create `.env` file in `frontend/` directory:
```env
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

**Step 3.3: Start Frontend**
```bash
npm run dev
```

The frontend should start on `http://localhost:5173`

---

## Verifying Everything Works

After starting both backend and frontend, test these features:

### ✅ Trial Status
- Should display usage counts (e.g., "5 left", "2 left")
- Should show loading state initially
- Should NOT be blank or stuck

### ✅ Resume Versions
1. Go to "My Resume Version" section
2. Try saving a version with a name
3. Should save without PGRST204 error
4. Refresh page and verify saved versions load

### ✅ Application Tracker
1. Add a new job application
2. Check Supabase dashboard → `applications` table
3. Should see the new entry
4. Try updating status and deleting

### ✅ AI Resume Analyser
1. Upload or paste a resume
2. Click analyze
3. Should NOT get "Promise.withResolvers is not a function" error
4. Should receive analysis results

---

## Common Errors & Solutions

### Error: "PGRST204: Could not find the 'version_name' column"
**Solution**: Run this in Supabase SQL Editor:
```sql
NOTIFY pgrst, 'reload schema';
```
Then restart backend server.

### Error: "Promise.withResolvers is not a function"
**Cause**: Backend not running or build failed
**Solution**:
```bash
cd backend
npm install
npm run build
npm start
```

### Error: "Trial Status" shows nothing
**Cause**: Frontend not connecting to backend or database
**Solution**:
1. Verify backend is running on port 3001
2. Check `.env` files have correct URLs
3. Check browser console for errors

### Error: "Database is not configured"
**Cause**: Backend can't connect to Supabase
**Solution**:
1. Verify `backend/.env` has correct `SUPABASE_URL` and `SUPABASE_ANON_KEY`
2. Restart backend after updating `.env`

### Applications or Versions not persisting
**Cause**: Database schema not applied or RLS policies blocking
**Solution**:
1. Re-run `database_schema.sql` in Supabase
2. Verify user is authenticated
3. Check Supabase logs for RLS policy errors

---

## Development Workflow

**Daily startup:**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Before committing:**
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

---

## Architecture Overview

- **Frontend**: React + TypeScript + Vite (port 5173)
- **Backend**: Express + TypeScript (port 3001)
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini API

**Data Flow:**
```
Frontend → Backend API → Supabase Database
         → Gemini API (for AI features)
```

---

## Need Help?

1. Check browser console (F12) for frontend errors
2. Check backend terminal for server errors
3. Check Supabase dashboard logs
4. Verify all `.env` files are configured correctly
5. Ensure database schema is applied and cache is reloaded
