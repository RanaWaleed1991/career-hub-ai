<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Career Hub AI - Full Stack Application

A production-ready career development platform with AI-powered resume building, cover letter generation, and job application tracking.

View your app in AI Studio: https://ai.studio/apps/drive/1ytay7JiMkxJ5IRWymIpQFoL5BTD-MGOg

## 🏗️ Project Structure

```
career-hub-ai/
├── frontend/          # React + Vite frontend
├── backend/           # Express + TypeScript backend
├── package.json       # Root package.json with dev scripts
└── README.md
```

## 🚀 Sprint 1: Backend Foundation - COMPLETED

Sprint 1 has successfully transformed the prototype into a production-ready application with:

✅ **Secure Backend API** - Express server with TypeScript on port 3001
✅ **Gemini AI Proxy** - API key hidden from frontend, secure backend proxy
✅ **CORS Configuration** - Proper frontend-backend communication
✅ **Environment Variables** - Separated configs for frontend and backend
✅ **Monorepo Structure** - Organized frontend and backend folders

### Backend API Endpoints

- `POST /api/gemini/enhance-summary` - Enhance resume summary or experience text
- `POST /api/gemini/generate-cover-letter` - Generate tailored cover letters
- `POST /api/gemini/analyze-resume` - Analyze resume with ATS scoring
- `POST /api/gemini/tailor-resume` - Tailor resume to job description

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/app/apikey)

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
# Install root dependencies (concurrently)
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install

# Return to root
cd ..
```

### 2. Configure Environment Variables

**Backend Configuration** (`backend/.env`):
```bash
# REQUIRED: Add your Gemini API key here
GEMINI_API_KEY=your_gemini_api_key_here

# Server configuration
PORT=3001
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

**Frontend Configuration** (`frontend/.env.local`):
```bash
# Backend API URL
VITE_API_URL=http://localhost:3001
```

⚠️ **IMPORTANT**: The `backend/.env` file contains your API key. Never commit this file to version control!

### 3. Run the Application

**Option A: Run Both Frontend and Backend Simultaneously (Recommended)**
```bash
npm run dev
```

**Option B: Run Separately**
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

## 🛠️ Available Scripts

### Root Scripts
- `npm run dev` - Run both frontend and backend concurrently
- `npm run dev:frontend` - Run only frontend
- `npm run dev:backend` - Run only backend
- `npm run build` - Build both frontend and backend
- `npm run build:frontend` - Build only frontend
- `npm run build:backend` - Build only backend

### Backend Scripts
- `npm run dev` - Start backend in development mode with hot reload
- `npm run build` - Build backend for production
- `npm start` - Start production backend server

### Frontend Scripts
- `npm run dev` - Start frontend development server
- `npm run build` - Build frontend for production
- `npm run preview` - Preview production build

## 🔒 Security Features

✅ **API Key Protection**: Gemini API key is stored only in backend environment variables
✅ **CORS Configuration**: Frontend can only access backend from configured URL
✅ **Environment Separation**: Frontend and backend have separate, isolated configs
✅ **Git Ignore**: All `.env` files are excluded from version control

## 📝 API Response Format

All backend endpoints return JSON responses:

**Success Response:**
```json
{
  "enhancedText": "...",
  "coverLetter": "...",
  "analysis": {...},
  "tailoredResume": "..."
}
```

**Error Response:**
```json
{
  "error": "Error message here"
}
```

## 🐛 Troubleshooting

### Backend won't start
- Verify `GEMINI_API_KEY` is set in `backend/.env`
- Check that port 3001 is not already in use
- Run `cd backend && npm install` to ensure dependencies are installed

### Frontend can't connect to backend
- Verify backend is running on port 3001
- Check `VITE_API_URL` in `frontend/.env.local` is set to `http://localhost:3001`
- Check browser console for CORS errors

### API Key errors
- Ensure your Gemini API key is valid and active
- Copy the key exactly from Google AI Studio (no extra spaces)
- Make sure the key is set in `backend/.env`, NOT `frontend/.env.local`

## 🎯 Next Steps

Sprint 1 is complete! Future sprints will include:
- User authentication and authorization
- Database integration for data persistence
- Advanced resume analytics
- Job application tracking
- Premium features

## 📄 License

This project was created with Google AI Studio.
