# AI Resume Reviewer — Frontend Client

Modern, high-performance **React 19** single-page application built with **Vite**, featuring intelligent ATS score auditing, AI bullet rewrites, side-by-side resume comparison, and job fitness matching.

---

## 🌟 Architecture & Directory Structure

The frontend is structured cleanly and modularly:

```
frontend/
├── .env                # Local environment variables (API endpoints, mock toggle)
├── .env.example        # Template for environment variables
├── index.html          # HTML entry point
├── package.json        # Frontend scripts and dependencies
├── vite.config.js      # Vite configuration & path aliases (@ -> /src)
└── src/
    ├── main.jsx        # React application entry point
    ├── App.jsx         # Root router & layout wrapper
    ├── components/     # Reusable UI components
    │   ├── analysis/   # Score visualizers, diff cards, metrics
    │   ├── ats/        # ATS scan badges, keyword tables
    │   ├── common/     # Navbar, Sidebar, Footer, Modal, Button
    │   ├── compare/    # Side-by-side comparison tables & widgets
    │   ├── resume/     # Resume upload zones, card displays
    │   └── ui/         # Core atomic UI primitives
    ├── context/        # Global state providers (ResumeContext, AuthContext)
    ├── mock/           # Standalone mock data fixtures (instant fallback)
    ├── pages/          # Application routes & page views
    │   ├── DashboardPage.jsx
    │   ├── ResumeUploadPage.jsx
    │   ├── AnalysisResultsPage.jsx
    │   ├── AtsAnalysisPage.jsx
    │   ├── JobMatchPage.jsx
    │   ├── BulletOptimizerPage.jsx
    │   ├── ResumeComparePage.jsx
    │   ├── ResumeHistoryPage.jsx
    │   ├── ProfilePage.jsx
    │   └── LoginPage.jsx
    ├── services/       # API clients for communication with backend services
    └── styles/         # Global stylesheets, CSS tokens, and animations
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment
Create or edit `frontend/.env`:
```env
# AI Resume Reviewer — Backend API Endpoints (Node.js & MongoDB)
VITE_USE_MOCK_DATA=false

VITE_AUTH_SERVICE_URL=http://localhost:5000/api/auth
VITE_RESUME_SERVICE_URL=http://localhost:5000/api/resumes
VITE_ANALYSIS_SERVICE_URL=http://localhost:5000/api/analysis
VITE_ATS_SERVICE_URL=http://localhost:5000/api/ats
VITE_JOB_MATCH_SERVICE_URL=http://localhost:5000/api/job-match
VITE_USER_SERVICE_URL=http://localhost:5000/api/users
```
> *Tip: If backend is offline or `VITE_USE_MOCK_DATA=true`, the application seamlessly falls back to rich mock data for zero-friction testing.*

### 3. Start Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```

---

## 🛠 Tech Stack
- **Framework:** React 19
- **Bundler & Dev Server:** Vite 6
- **Routing:** React Router v7
- **Icons:** Lucide React
- **Animations & Effects:** Canvas Confetti & Modern CSS
