# Supabase Authentication Setup Guide

This document explains how to set up Supabase authentication for Career Hub AI.

## Prerequisites

- A Supabase account (sign up at https://app.supabase.com)
- Node.js and npm installed

## Step 1: Create a Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in the project details:
   - **Name**: Career Hub AI (or your preferred name)
   - **Database Password**: Choose a strong password (save this securely!)
   - **Region**: Select the region closest to your users
4. Click "Create new project"
5. Wait for the project to finish setting up (usually takes 1-2 minutes)

## Step 2: Get Your Supabase Credentials

1. Once your project is ready, go to **Settings** > **API**
2. You'll need three values:

   - **Project URL**: Found under "Project URL"
   - **Anon/Public Key**: Found under "Project API keys" → `anon` `public`
   - **Service Role Key**: Found under "Project API keys" → `service_role` (⚠️ Keep this secret!)

## Step 3: Configure Environment Variables

### Frontend (.env.local)

Create/update `frontend/.env.local`:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Backend (.env)

Update `backend/.env`:

```env
SUPABASE_URL=your_project_url_here
SUPABASE_SERVICE_KEY=your_service_role_key_here
```

⚠️ **IMPORTANT**:
- Frontend uses the **anon key** (safe to expose in browser)
- Backend uses the **service_role key** (must be kept secret, never commit to git)

## Step 4: Configure Authentication Providers

### Email/Password Authentication (Enabled by Default)

Email authentication is enabled by default. No additional setup required!

### Google OAuth (Optional)

1. Go to **Authentication** > **Providers** in Supabase
2. Click on **Google**
3. Enable the provider
4. Follow the instructions to create OAuth credentials in Google Cloud Console
5. Add the **Client ID** and **Client Secret** from Google
6. Add authorized redirect URL: `https://your-project.supabase.co/auth/v1/callback`
7. Click **Save**

### Facebook OAuth (Optional)

1. Go to **Authentication** > **Providers** in Supabase
2. Click on **Facebook**
3. Enable the provider
4. Create a Facebook App at https://developers.facebook.com
5. Add the **App ID** and **App Secret** from Facebook
6. Add authorized redirect URL: `https://your-project.supabase.co/auth/v1/callback`
7. Click **Save**

## Step 5: Database Schema (Auto-Created)

Supabase Auth automatically creates the necessary tables in the `auth` schema:
- `auth.users` - User authentication data
- `auth.sessions` - User sessions

### Optional: Create User Profiles Table

If you want to store additional user data:

```sql
-- Run this in the SQL Editor in Supabase
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  subscription_status TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);
```

## Step 6: Configure Email Settings (Optional)

By default, Supabase uses a development SMTP server that works for testing but has limitations.

For production:
1. Go to **Settings** > **Auth**
2. Scroll to **SMTP Settings**
3. Configure your own SMTP server (recommended: SendGrid, AWS SES, or Mailgun)

## Step 7: Test Your Setup

1. Install dependencies:
   ```bash
   npm install
   cd frontend && npm install
   cd ../backend && npm install
   ```

2. Start both servers:
   ```bash
   # Terminal 1: Frontend
   cd frontend && npm run dev

   # Terminal 2: Backend
   cd backend && npm run dev
   ```

3. Test authentication:
   - Navigate to http://localhost:3000 (or your frontend port)
   - Try signing up with email/password
   - Try logging in
   - Try OAuth providers (if configured)

## Security Best Practices

1. **Never commit `.env` files** to version control (already in .gitignore)
2. **Never expose `service_role` key** in frontend code
3. **Use Row Level Security (RLS)** for all database tables
4. **Enable email confirmations** for production:
   - Go to **Authentication** > **Settings**
   - Enable "Confirm email" under Email Auth
5. **Configure allowed redirect URLs** in production:
   - Go to **Authentication** > **URL Configuration**
   - Add your production domain

## Troubleshooting

### "Invalid API key" error
- Check that you've copied the correct keys
- Make sure frontend uses `anon` key, backend uses `service_role` key
- Verify environment variables are loaded correctly

### Email not sending
- Check spam folder
- For production, configure custom SMTP (see Step 6)
- Check Supabase logs under **Logs** > **Auth**

### OAuth redirect not working
- Verify redirect URLs match exactly in provider settings
- Check that OAuth provider is enabled in Supabase
- Ensure correct Client ID and Secret are configured

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/auth-signup)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## Admin User Setup

The app has a special admin user with email `admin@careerhub.ai`. To set this up:

1. Sign up through the app with email `admin@careerhub.ai`
2. Or manually create in Supabase SQL Editor:
   ```sql
   -- This will be created automatically when admin signs up
   -- No special setup needed
   ```

The admin role is checked based on email address in the frontend code.
