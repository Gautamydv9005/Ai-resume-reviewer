import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import { useAuth } from './context/AuthContext';

// Route-level code splitting
const LandingPage = lazy(() => import('./pages/LandingPage'));
const UploadPage = lazy(() => import('./pages/UploadPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AnalysisDashboardPage = lazy(() => import('./pages/AnalysisDashboardPage'));
const AtsAnalysisPage = lazy(() => import('./pages/AtsAnalysisPage'));
const JobMatchPage = lazy(() => import('./pages/JobMatchPage'));
const AiFeedbackPage = lazy(() => import('./pages/AiFeedbackPage'));
const ImprovementSuggestionsPage = lazy(() => import('./pages/ImprovementSuggestionsPage'));
const ResumeHistoryPage = lazy(() => import('./pages/ResumeHistoryPage'));
const ResumeComparePage = lazy(() => import('./pages/ResumeComparePage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

// Auth Pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const GoogleCallbackPage = lazy(() => import('./pages/auth/GoogleCallbackPage'));
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmailPage'));

function PageLoader() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" style={{ width: '36px', height: '36px' }} />
    </div>
  );
}

// Route Guards
// Allows registered users or guests with a valid guest review session
function ReviewRoute({ children }) {
  const { isAuthenticated, isGuest, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: '36px', height: '36px' }} />
      </div>
    );
  }

  if (!isAuthenticated && !isGuest) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// Strictly requires authenticated registered account (Dashboard, History, Compare, Profile)
function RegisteredUserRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: '36px', height: '36px' }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function PublicAuthRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: '36px', height: '36px' }} />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  const { isAuthenticated, isGuest, isLoading } = useAuth();

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        <Suspense fallback={<PageLoader />}>
          <Routes>
          {/* Root: When a user visits the website, if unauthenticated and not guest, require signup/login first */}
          <Route
            path="/"
            element={
              isLoading ? (
                <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="spinner" style={{ width: '36px', height: '36px' }} />
                </div>
              ) : (isAuthenticated || isGuest) ? (
                <LandingPage />
              ) : (
                <LoginPage initialMode="signup" />
              )
            }
          />

          {/* Authentication */}
          <Route
            path="/login"
            element={
              <PublicAuthRoute>
                <LoginPage initialMode="signin" />
              </PublicAuthRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicAuthRoute>
                <LoginPage initialMode="signup" />
              </PublicAuthRoute>
            }
          />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/auth/callback/google" element={<GoogleCallbackPage />} />

          {/* Main User Workspace (Registered Users Only) */}
          <Route
            path="/dashboard"
            element={
              <RegisteredUserRoute>
                <DashboardPage />
              </RegisteredUserRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ReviewRoute>
                <UploadPage />
              </ReviewRoute>
            }
          />

          {/* Analysis & ATS Engine Views (Registered Users & Active Guests) */}
          <Route
            path="/analysis/:resumeId"
            element={
              <ReviewRoute>
                <AnalysisDashboardPage />
              </ReviewRoute>
            }
          />
          <Route
            path="/ats-analysis/:resumeId"
            element={
              <ReviewRoute>
                <AtsAnalysisPage />
              </ReviewRoute>
            }
          />
          <Route
            path="/job-match/:resumeId"
            element={
              <ReviewRoute>
                <JobMatchPage />
              </ReviewRoute>
            }
          />
          <Route
            path="/analysis/:resumeId/feedback"
            element={
              <ReviewRoute>
                <AiFeedbackPage />
              </ReviewRoute>
            }
          />
          <Route
            path="/analysis/:resumeId/improvements"
            element={
              <ReviewRoute>
                <ImprovementSuggestionsPage />
              </ReviewRoute>
            }
          />

          {/* History, Comparison & Settings (Registered Users Only) */}
          <Route
            path="/resume-history"
            element={
              <RegisteredUserRoute>
                <ResumeHistoryPage />
              </RegisteredUserRoute>
            }
          />
          <Route
            path="/compare"
            element={
              <RegisteredUserRoute>
                <ResumeComparePage />
              </RegisteredUserRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <RegisteredUserRoute>
                <ProfilePage />
              </RegisteredUserRoute>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </main>

      <Footer />
    </div>
  );
}
