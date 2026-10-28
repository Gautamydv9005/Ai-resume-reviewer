# AI Resume Reviewer — Backend Service (Node.js & MongoDB)

High-performance REST API backend powering the **AI Resume Reviewer** platform. Built with **Node.js**, **Express**, and **MongoDB / Mongoose**, featuring intelligent document parsing, ATS heuristic audits, job fitness matching, and AI bullet rewrites.

---

## 🌟 Key Features

1. **Authentication Microservice (`/api/auth`)**
   - User registration and login with bcrypt password hashing and signed JWT tokens.
   - Password reset flow with reset tokens.
   - Current session profile (`/me`).
   - Secure one-time guest access with server-side session tracking and atomic concurrency limits.

2. **Resume Ingestion & Processing (`/api/resumes`)**
   - Multipart document upload supporting **PDF** (`pdf-parse`) and **DOCX** (`mammoth`).
   - Automated text extraction and section segmentation (Summary, Experience, Education, Skills, Projects, Certifications).
   - Instant calculation of Overall, ATS, and Job Match scores.
   - History retrieval, resume renaming, and deletion.

3. **AI Analysis Engine (`/api/analysis`)**
   - Section-by-section audit with numerical scores, status indicators, and targeted advice.
   - Comprehensive Strengths, Weaknesses, and High-Priority Action Items.
   - Concrete bullet point rewrites utilizing Google's **X-Y-Z formula** (`Accomplished [X] as measured by [Y], by doing [Z]`).
   - Side-by-side resume comparison endpoint (`/compare?v1=...&v2=...`) with differential metric calculations.
   - Optional Google Gemini API integration (pass `GEMINI_API_KEY` in `.env`).

4. **ATS Compatibility & Keyword Engine (`/api/ats`)**
   - Keyword density scanner indexing 50+ programming languages, frameworks, cloud platforms, and engineering methodologies.
   - Real-time matched vs. missing keyword classifications.
   - Formatting audit checks: Layout columns, optical layer clarity, header/footer text bounds, tables, fonts.
   - Optical section detection confidence scores.

5. **Job Description Matcher (`/api/job-match`)**
   - Role fit breakdown (Frontend, Backend, Cloud, Scalability, Leadership).
   - Core vs. preferred skills detection.
   - Experience seniority audit against requirements.
   - Dynamic on-the-fly matcher (`/match`) for pasting custom job descriptions.

6. **User Profile Service (`/api/users`)**
   - Profile management, target role settings, and cumulative aggregate statistics.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18+ or v20+)
- **MongoDB** (Local `mongod` instance or MongoDB Atlas connection string)
  > *Note: If a local MongoDB daemon is not detected, the backend automatically engages an intelligent in-memory fallback store so development and testing can proceed seamlessly without interruptions.*

### 2. Install Dependencies
```bash
cd backend
npm install
```

### 3. Configure Environment
Create or edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/ai_resume_reviewer
JWT_SECRET=resumate_ai_jwt_secret_key_2026_production_grade
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=
NODE_ENV=development
```

### 4. Run the Server
```bash
# Start in watch mode (Node 18+/24+)
npm run dev

# Or standard production start
npm start
```

The unified API server will be available at: **`http://localhost:5000`**
- Health Check: `http://localhost:5000/health`
- Also listens on microservice ports `5001-5006` for direct port routing if desired.

---

## 📚 API Endpoints Summary

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login user and issue JWT |
| `POST` | `/api/auth/forgot-password` | Request password reset instructions |
| `POST` | `/api/auth/reset-password` | Reset password using token |
| `GET` | `/api/auth/me` | Fetch authenticated user data |

### Resumes (`/api/resumes`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/resumes/upload` | Upload PDF/DOCX and trigger full AI analysis |
| `GET` | `/api/resumes/history` | List all evaluated resumes |
| `GET` | `/api/resumes/:id` | Get resume metadata |
| `PATCH` | `/api/resumes/:id/rename` | Rename resume file |
| `DELETE` | `/api/resumes/:id` | Delete resume and associated reports |

### AI Analysis (`/api/analysis`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/analysis/:resumeId` | Retrieve full analysis results |
| `POST` | `/api/analysis/:resumeId/reanalyze` | Re-run AI analysis with updated parameters |
| `GET` | `/api/analysis/compare?v1=:id1&v2=:id2` | Side-by-side comparison of two resumes |

### ATS Compatibility (`/api/ats`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/ats/:resumeId` | Get ATS audit, score, and keywords |
| `GET` | `/api/ats/:resumeId/keywords` | Get matched and missing keywords breakdown |

### Job Match (`/api/job-match`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/job-match/:resumeId` | Get job match and role fit breakdown |
| `POST` | `/api/job-match/:resumeId` | Re-evaluate with updated job description |
| `POST` | `/api/job-match/:resumeId/match` | Dynamic match score evaluation against job text |

### Users (`/api/users`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/users/profile` | Get current user profile |
| `PUT` | `/api/users/profile` | Update profile settings |
