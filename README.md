<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Career Hub AI - Professional Career Development Platform

> 🚀 **Production-Ready** - A comprehensive career development SaaS platform with AI-powered resume building, analysis, cover letter generation, and job application tracking.

[![Status](https://img.shields.io/badge/status-production--ready-green)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

View your app in AI Studio: https://ai.studio/apps/drive/1ytay7JiMkxJ5IRWymIpQFoL5BTD-MGOg

---

## 📖 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Documentation](#-documentation)
- [Security](#-security)
- [Deployment](#-deployment)

---

## ✨ Features

### 🎨 **Resume Builder**
- **5 Professional Templates**: Modern, Professional, Creative, Minimal, Picture
- **Complete Resume Sections**: Personal details, summary, experience, education, skills, certifications, references, custom sections
- **Photo Upload**: Profile picture support (Picture template)
- **High-Quality PDF Export**: Professional PDFs with proper formatting (scale: 4)
- **Loading Indicators**: User-friendly 7-12 second PDF generation with progress modal

### 🤖 **AI-Powered Features**
- **AI Resume Analysis**
  - ATS compatibility scoring
  - Overall feedback and improvement suggestions
  - Recruiter summary analysis
  - Professional PDF report generation (2 pages)
- **AI Summary Enhancement**: Improve professional summaries with AI
- **AI Cover Letter Generation**: Create tailored cover letters from job descriptions
- **AI Resume Tailoring**: Customize resume content for specific jobs with clear usage instructions

### 💼 **Job Search & Application Tracking**
- **Job Search**: Powered by Adzuna API
- **Save Applications**: Track job applications
- **Status Management**: Applied, Interview, Offer, Rejected
- **Application Dashboard**: View and manage all applications

### 📚 **Learning Resources**
- **Course Catalog**: Browse professional development courses
- **Course Details**: Comprehensive course information
- **Smart Caching**: Fast course browsing (10 min cache)

### 💳 **Premium Subscription**
- **Stripe Integration**: Secure payment processing
- **Free Tier**: 3 AI analyses
- **Premium Tier**: Unlimited AI features
- **Subscription Management**: Easy upgrade/cancel
- **Email Notifications**: Payment confirmations, cancellation notices

### 📦 **Resume Version Control**
- **Save Versions**: Multiple resume versions
- **Load Versions**: Restore previous versions
- **Version History**: Track changes over time

### 🔒 **Authentication & Security**
- **Supabase Auth**: Secure user authentication
- **Email/Password**: Standard authentication
- **Password Reset**: Email-based password recovery
- **Session Management**: JWT tokens with expiration

### 📧 **Email Notifications**
- **Welcome Emails**: Onboarding new users
- **Password Reset**: Secure password recovery
- **Payment Confirmations**: Transaction receipts
- **Subscription Updates**: Status change notifications
- **SendGrid Integration**: Reliable email delivery

---

## 🛠️ Tech Stack

### **Frontend**
- **React 19** - Modern UI library
- **TypeScript** - Type safety
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first styling
- **html2pdf.js** - High-quality PDF generation
- **pdfjs-dist** - PDF text extraction

### **Backend**
- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type safety
- **Supabase** - Database & authentication
- **Stripe** - Payment processing
- **Google Gemini AI** - AI-powered features
- **Adzuna API** - Job search

### **Security & Performance**
- **Helmet** - Security headers
- **CORS** - Cross-origin protection
- **Express Rate Limit** - Abuse prevention
- **Express Validator** - Input validation
- **Compression** - 60-80% response size reduction
- **Node-Cache** - Smart API caching

### **DevOps**
- **Vercel** - Hosting platform
- **GitHub** - Version control
- **Jest** - Testing framework
- **Playwright** - E2E testing

---

## 🏗️ Project Structure

```
career-hub-ai/
├── frontend/                 # React + Vite frontend
│   ├── components/          # React components
│   ├── services/            # API services
│   ├── templates/           # Resume templates
│   ├── types/               # TypeScript types
│   └── public/              # Static assets
├── backend/                 # Express + TypeScript backend
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Auth, rate limiting, security
│   │   ├── services/       # Business logic
│   │   ├── config/         # Configuration
│   │   └── utils/          # Helper functions
│   └── tests/              # Unit & integration tests
├── DEPLOYMENT_GUIDE.md     # Environment setup guide
├── PRE-LAUNCH_CHECKLIST.md # Comprehensive launch checklist
└── README.md               # This file
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18 or higher
- **npm** or **yarn**
- **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Supabase Project** from [Supabase](https://supabase.com)
- **Stripe Account** from [Stripe](https://stripe.com)
- **SendGrid Account** from [SendGrid](https://sendgrid.com)
- **Adzuna API Keys** from [Adzuna](https://developer.adzuna.com)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/career-hub-ai.git
cd career-hub-ai

# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install

# Return to root
cd ..
```

### Environment Configuration

#### Backend `.env` File
```bash
# Copy example file
cd backend
cp .env.example .env

# Edit .env with your credentials
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_key
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_PRICE_ID=price_your_id
ADZUNA_APP_ID=your_app_id
ADZUNA_APP_KEY=your_app_key
SENDGRID_API_KEY=SG.your_key
EMAIL_FROM=your-email@domain.com
EMAIL_FROM_NAME=Career Hub AI
FRONTEND_URL=http://localhost:5173
PORT=3001
NODE_ENV=development
```

#### Frontend `.env.local` File
```bash
# Copy example file
cd frontend
cp .env.example .env.local

# Edit .env.local with your credentials
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

### Database Setup

Run the SQL migrations in your Supabase SQL Editor to create required tables:
- `subscriptions`
- `resumes`
- `resume_versions`
- `applications`
- `jobs`
- `courses`
- `course_enrollments`

See `backend/migrations/` for SQL scripts.

### Running the Application

#### Development Mode (Both Servers)
```bash
npm run dev
```

This runs both frontend (port 5173) and backend (port 3001) concurrently.

#### Separately
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

---

## 📚 Documentation

- **[Deployment Guide](./DEPLOYMENT_GUIDE.md)** - Production deployment instructions
- **[Pre-Launch Checklist](./PRE-LAUNCH_CHECKLIST.md)** - Comprehensive launch preparation
- **[API Documentation](./backend/README.md)** - Backend API endpoints

---

## 🔒 Security

### Implemented Security Features

✅ **Application Security**
- HTTPS enforcement
- Helmet security headers (XSS, clickjacking, MIME-sniffing protection)
- CORS with whitelisted origins
- Request size limits (10MB max)
- Input validation and sanitization
- SQL injection protection via Supabase
- Environment variable validation

✅ **Rate Limiting**
- Auth endpoints: 10 attempts/15min (brute force protection)
- AI endpoints: 500 requests/hour (cost control)
- Payment endpoints: 10 requests/hour (fraud prevention)
- Admin endpoints: 30 requests/hour (abuse prevention)
- General API: 100 requests/15min (standard protection)

✅ **Authentication & Authorization**
- JWT-based authentication via Supabase
- Secure password hashing
- Email verification support
- Password reset flow
- Session management

✅ **Data Protection**
- Row Level Security (RLS) in Supabase
- Users can only access their own data
- Encrypted connections (TLS)
- Encrypted data at rest

✅ **Payment Security**
- PCI DSS compliant via Stripe
- Webhook signature verification
- Secure API key storage
- Live/test mode separation

---

## 🚀 Deployment

### Vercel Deployment (Recommended)

#### Backend
```bash
cd backend
vercel --prod
```

**Environment Variables**: Set in Vercel Dashboard → Settings → Environment Variables
- All variables from `backend/.env.example`
- Use **LIVE** keys for Stripe (sk_live_..., pk_live_...)
- Set `NODE_ENV=production`

#### Frontend
```bash
cd frontend
vercel --prod
```

**Environment Variables**: Set in Vercel Dashboard
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_STRIPE_PUBLISHABLE_KEY` (use pk_live_... for production)

### Pre-Deployment Checklist

See [PRE-LAUNCH_CHECKLIST.md](./PRE-LAUNCH_CHECKLIST.md) for comprehensive checklist covering:
- Environment configuration
- Third-party service setup (Stripe, Supabase, SendGrid)
- Security verification
- Performance testing
- Database backups
- Monitoring setup
- Legal compliance (Privacy Policy, Terms of Service)

### Production Readiness

✅ **Code Quality**
- TypeScript for type safety
- Comprehensive error handling
- Security checks on startup
- Test email routes removed

✅ **Performance**
- Response compression (60-80% reduction)
- Smart caching (jobs: 5min, courses: 10min)
- Database indexing
- Connection pooling
- Optimized PDF generation with loading indicators

✅ **Monitoring**
- Health check endpoint: `/health`
- Request logging
- Error logging
- Suspicious activity detection
- Ready for Sentry integration

---

## 🧪 Testing

```bash
# Backend unit tests
cd backend
npm run test

# Backend integration tests
npm run test:integration

# E2E tests (from root)
npm run test:e2e

# E2E with UI
npm run test:e2e:ui
```

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/password-reset` - Request password reset
- `POST /api/auth/verify-reset-token` - Verify reset token
- `POST /api/auth/update-password` - Update password

### Resumes
- `GET /api/resumes` - Get user's resumes
- `POST /api/resumes` - Create resume
- `GET /api/resumes/:id` - Get resume by ID
- `PUT /api/resumes/:id` - Update resume
- `DELETE /api/resumes/:id` - Delete resume

### Resume Versions
- `GET /api/versions/:resumeId` - Get versions for resume
- `POST /api/versions` - Save resume version
- `GET /api/versions/detail/:versionId` - Get version details

### AI Features
- `POST /api/gemini/enhance-summary` - Enhance resume summary
- `POST /api/gemini/generate-cover-letter` - Generate cover letter
- `POST /api/gemini/analyze-resume` - Analyze resume with ATS scoring
- `POST /api/gemini/tailor-resume` - Tailor resume to job

### Applications
- `GET /api/applications` - Get user's applications
- `POST /api/applications` - Create application
- `PUT /api/applications/:id` - Update application
- `DELETE /api/applications/:id` - Delete application

### Subscriptions
- `GET /api/subscriptions/status` - Get subscription status
- `POST /api/subscriptions/check-usage` - Check AI usage limit

### Payments
- `POST /api/payments/create-checkout-session` - Create Stripe checkout
- `POST /api/payments/create-portal-session` - Manage subscription

### Jobs
- `GET /api/jobs/search` - Search jobs (cached 5 min)
- `POST /api/jobs` - Create job (admin only)

### Courses
- `GET /api/courses` - Get all courses (cached 10 min)
- `POST /api/courses` - Create course (admin only)

### User Management
- `DELETE /api/user/account` - Delete user account (GDPR)
- `GET /api/user/data` - Export user data (GDPR)

### Webhooks
- `POST /api/webhooks/stripe` - Stripe webhook handler

---

## 🤝 Contributing

Contributions welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini AI** - AI-powered features
- **Supabase** - Database and authentication
- **Stripe** - Payment processing
- **Adzuna** - Job search API
- **SendGrid** - Email delivery
- **Vercel** - Hosting platform

---

## 📞 Support

- **Documentation**: See [docs/](./docs/) folder
- **Issues**: Open an issue on GitHub
- **Email**: support@careerhubai.com (update with your email)

---

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] LinkedIn integration
- [ ] Resume templates marketplace
- [ ] AI interview preparation
- [ ] Salary negotiation assistant
- [ ] Career path recommendations
- [ ] Company review integration
- [ ] Networking features

---

**Built with ❤️ using Google AI Studio**

**Status**: ✅ Production Ready | **Version**: 1.0.0 | **Last Updated**: 2024
