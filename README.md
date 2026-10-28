# AI Resume Reviewer — Full-Stack Platform

Comprehensive AI-powered resume analysis, ATS scoring, and job fitness platform built with **React 19 (Vite)** on the frontend and **Node.js (Express & MongoDB)** on the backend.

---

## 📁 Repository Structure

```
Ai Resuma reviewer/
├── frontend/               # React 19 + Vite client application
│   ├── .env                # Frontend environment configuration
│   ├── .env.example        # Frontend environment example
│   ├── index.html          # Single Page Application HTML shell
│   ├── package.json        # Frontend scripts and dependencies
│   ├── vite.config.js      # Vite build & alias configuration
│   ├── README.md           # Frontend guide & documentation
│   └── src/
│       ├── components/     # UI components (ATS badges, diff cards, modals, layout)
│       ├── context/        # Global state providers (ResumeContext, AuthContext)
│       ├── mock/           # Standalone mock data for offline testing
│       ├── pages/          # Application views & routes
│       ├── services/       # REST API integration services
│       └── styles/         # Global styles & design system tokens
│
├── backend/                # Node.js + Express + MongoDB REST API server
│   ├── .env                # Backend environment configuration
│   ├── .env.example        # Backend environment template
│   ├── package.json        # Backend scripts and dependencies
│   ├── server.js           # Express application entry point
│   ├── README.md           # Backend service documentation
│   ├── config/             # Database connection & configurations
│   ├── controllers/        # Request handlers (auth, resumes, analysis, ats)
│   ├── middleware/         # Auth verification & file upload handlers
│   ├── models/             # Mongoose schemas (User, Resume, Analysis)
│   ├── routes/             # Express API routing endpoints
│   ├── services/           # Parsing & scoring business logic engines
│   └── utils/              # Data stores, seeders, and helpers
│
├── .gitignore              # Git ignore configuration
├── package.json            # Root workspace scripts to run both apps
└── README.md               # Main project overview and setup guide
```

---

## ⚡ Quick Start

### 1. Install Dependencies
You can install dependencies for both apps simultaneously from the root:
```bash
npm run install:all
```
*(Or navigate into each folder and run `npm install`)*

---

### 2. Configure Environment Files

- **Frontend (`frontend/.env`):**
  ```env
  VITE_USE_MOCK_DATA=false
  VITE_AUTH_SERVICE_URL=http://localhost:5000/api/auth
  VITE_RESUME_SERVICE_URL=http://localhost:5000/api/resumes
  VITE_ANALYSIS_SERVICE_URL=http://localhost:5000/api/analysis
  VITE_ATS_SERVICE_URL=http://localhost:5000/api/ats
  VITE_JOB_MATCH_SERVICE_URL=http://localhost:5000/api/job-match
  VITE_USER_SERVICE_URL=http://localhost:5000/api/users
  ```

- **Backend (`backend/.env`):**
  ```env
  PORT=5000
  MONGODB_URI=mongodb+srv://<USER>:<PASS>@.../ai_resume_reviewer
  JWT_SECRET=your_jwt_secret_key_here
  JWT_EXPIRES_IN=7d
  CLIENT_URL=http://localhost:5173
  GEMINI_API_KEY=your_gemini_api_key_optional
  NODE_ENV=development
  ```

---

## 🚀 Running the Applications

### Run from the Root:
| Action | Command |
|---|---|
| **Start Full App (Frontend + Backend)** | `npm run dev` (starts both simultaneously) |
| **Start Frontend Only** | `npm run frontend` |
| **Start Backend Only** | `npm run backend` or `npm run backend:dev` |
| **Build Frontend** | `npm run build` |
| **Seed Database** | `npm run seed` |

### Or Run Independently:
- **Frontend**:
  ```bash
  cd frontend
  npm run dev
  ```
- **Backend**:
  ```bash
  cd backend
  npm run dev
  ```
