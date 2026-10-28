import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import { useAuth } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import UploadPage from './pages/UploadPage';
import DashboardPage from './pages/DashboardPage';
import AnalysisDashboardPage from './pages/AnalysisDashboardPage';
import AtsAnalysisPage from './pages/AtsAnalysisPage';
import JobMatchPage from './pages/JobMatchPage';
import AiFeedbackPage from './pages/AiFeedbackPage';
import ImprovementSuggestionsPage from './pages/ImprovementSuggestionsPage';
import ResumeHistoryPage from './pages/ResumeHistoryPage';
import ResumeComparePage from './pages/ResumeComparePage';
import ProfilePage from './pages/ProfilePage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import GoogleCallbackPage from './pages/auth/GoogleCallbackPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';

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
      </main>

      <Footer />
    </div>
  );
}
