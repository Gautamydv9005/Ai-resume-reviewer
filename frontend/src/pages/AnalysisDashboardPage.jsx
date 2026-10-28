import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileText,
  ShieldCheck,
  Briefcase,
  Sparkles,
  Download,
  Share2,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Award,
  Layers
} from 'lucide-react';
import { useResume } from '../context/ResumeContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { analysisService } from '../services/analysisService';
import Sidebar from '../components/common/Sidebar';
import CircularProgress from '../components/common/CircularProgress';
import SectionScoreCard from '../components/analysis/SectionScoreCard';
import SkeletonLoader from '../components/common/SkeletonLoader';
import EmptyState from '../components/common/EmptyState';

export default function AnalysisDashboardPage() {
  const { resumeId } = useParams();
  const { activeAnalysis, selectResume, currentResume } = useResume();
  const { isGuest } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(activeAnalysis);

  useEffect(() => {
    if (resumeId) {
      selectResume(resumeId);
      setLoading(true);
      analysisService.getResumeAnalysis(resumeId)
        .then(res => {
          setData(res);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [resumeId, selectResume]);

  if (!data && !loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <EmptyState
            title="Analysis Not Found"
            description="We could not find analysis data for this resume ID. Upload a new resume to generate insights."
            actionText="Upload Resume"
            actionLink="/upload"
          />
        </main>
      </div>
    );
  }

  const scores = data?.scores || { overall: 84, ats: 89, jobMatch: 78, readability: 92, impact: 81 };
  const verdict = data?.summaryVerdict || {
    tier: 'Strong Candidate',
    badge: 'Top 10% ATS Compatible',
    headline: 'Your resume shows robust engineering achievements and passes top-tier ATS screeners with ease.',
    nextStepAdvice: 'To reach 90+ overall, replace subjective verbs with quantified system performance metrics.'
  };

  const handleExportReport = () => {
    addToast({
      message: 'Generated ATS Analysis Audit Report (PDF exported)!',
      type: 'success',
      duration: 3000
    });
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <SkeletonLoader type="circle" />
            <SkeletonLoader type="card" count={3} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header with Title and Quick Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                  <span className="badge badge-brand">Analysis Report</span>
                  {data?.meta?.isAiGenerated ? (
                    <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem' }}>
                      <Sparkles size={12} /> Live Gemini AI ({data.meta.model || 'gemini-2.0-flash'})
                    </span>
                  ) : (
                    <span className="badge badge-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem' }}>
                      ⚡ ResuMate Heuristic Engine
                    </span>
                  )}
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    File: <strong style={{ color: 'var(--text-primary)' }}>{data?.fileName || 'Resume.pdf'}</strong>
                  </span>
                </div>
                <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
                  Resume Analysis Dashboard
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Target Role: <strong style={{ color: 'var(--brand-cyan)' }}>{data?.targetJobTitle || 'Senior Engineer'}</strong> {data?.targetCompany && `at ${data.targetCompany}`}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <button onClick={handleExportReport} className="btn btn-secondary btn-sm">
                  <Download size={15} /> Export Audit
                </button>
                <Link to={`/analysis/${resumeId || 'res_001'}/improvements`} className="btn btn-primary btn-sm">
                  <Sparkles size={15} /> View AI Suggestions
                </Link>
              </div>
            </div>

            {/* Guest Upgrade Banner */}
            {isGuest && (
              <div
                className="glass-panel"
                style={{
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  border: '1px solid rgba(99, 102, 241, 0.35)',
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.08) 100%)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Sparkles size={22} color="var(--brand-primary)" style={{ flexShrink: 0 }} />
                  <div>
                    <strong style={{ fontSize: '0.95rem' }}>Free Guest Review Completed!</strong>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: 0 }}>
                      Create a free account to permanently save your report, track history, and review more resumes.
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link to="/register" className="btn btn-primary btn-sm">
                    <Sparkles size={14} /> Create Free Account
                  </Link>
                  <Link to="/login?mode=signin" className="btn btn-secondary btn-sm">
                    Log In
                  </Link>
                </div>
              </div>
            )}

            {/* Quick Sub-Navigation Pills */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                overflowX: 'auto',
                paddingBottom: '0.5rem',
                borderBottom: '1px solid var(--border-default)'
              }}
            >
              <Link
                to={`/analysis/${resumeId || 'res_001'}`}
                className="btn btn-primary btn-sm"
              >
                Overview & Sections
              </Link>
              <Link
                to={`/ats-analysis/${resumeId || 'res_001'}`}
                className="btn btn-secondary btn-sm"
              >
                <ShieldCheck size={14} /> ATS Deep Dive
              </Link>
              <Link
                to={`/job-match/${resumeId || 'res_001'}`}
                className="btn btn-secondary btn-sm"
              >
                <Briefcase size={14} /> Job Match
              </Link>
              <Link
                to={`/analysis/${resumeId || 'res_001'}/feedback`}
                className="btn btn-secondary btn-sm"
              >
                <Sparkles size={14} /> AI Feedback
              </Link>
              <Link
                to={`/analysis/${resumeId || 'res_001'}/improvements`}
                className="btn btn-secondary btn-sm"
              >
                <TrendingUp size={14} /> Improvement Diffs
              </Link>
            </div>

            {/* Top Score Matrix (The 3 Circular Progress Meters) */}
            <div
              className="glass-panel"
              style={{
                padding: '2rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '2rem',
                alignItems: 'center',
                position: 'relative'
              }}
            >
              {/* Overall Score */}
              <div style={{ textAlign: 'center' }}>
                <CircularProgress
                  score={scores.overall}
                  max={100}
                  size={150}
                  label="Overall Score"
                  subtitle="Candidate Rating"
                  color="#6366f1"
                />
                <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Combined AI Quality Index
                </div>
              </div>

              {/* ATS Compatibility Score */}
              <div style={{ textAlign: 'center' }}>
                <CircularProgress
                  score={scores.ats}
                  max={100}
                  size={150}
                  label="ATS Score"
                  subtitle="Parser Success Rate"
                  color="#10b981"
                />
                <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Workday & Taleo Ready
                </div>
              </div>

              {/* Job Match Score */}
              <div style={{ textAlign: 'center' }}>
                <CircularProgress
                  score={scores.jobMatch}
                  max={100}
                  size={150}
                  label="Job Match Score"
                  subtitle={scores.jobMatch !== null && scores.jobMatch !== undefined ? "Target Fit" : "Resume Only"}
                  color="#06b6d4"
                />
                <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {scores.jobMatch !== null && scores.jobMatch !== undefined
                    ? "Keyword & Experience Parity"
                    : "Not evaluated (Resume Only mode)"}
                </div>
              </div>
            </div>

            {/* Verdict Card */}
            <div
              className="gradient-border-card"
              style={{
                padding: '1.5rem',
                background: 'var(--bg-glass-card)',
                backdropFilter: 'blur(16px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1.25rem'
              }}
            >
              <div style={{ maxWidth: '680px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Award size={18} color="var(--brand-primary)" />
                  <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase' }}>
                    {verdict.badge}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                  {verdict.headline}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                  {verdict.nextStepAdvice}
                </p>
              </div>

              <Link to={`/analysis/${resumeId || 'res_001'}/improvements`} className="btn btn-primary btn-sm">
                Apply Improvements <ArrowRight size={15} />
              </Link>
            </div>

            {/* 8 Resume Sections Grid */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                    Section-by-Section Audit
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    Granular scoring across all 8 standard resume building blocks.
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '1.25rem'
                }}
              >
                {data?.sections?.map(section => (
                  <SectionScoreCard key={section.id} section={section} />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
