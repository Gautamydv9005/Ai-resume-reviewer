import React from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  UploadCloud,
  FileCheck2,
  TrendingUp,
  Award,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useResume } from '../context/ResumeContext';
import Sidebar from '../components/common/Sidebar';
import CircularProgress from '../components/common/CircularProgress';
import ScoreBadge from '../components/common/ScoreBadge';

export default function DashboardPage() {
  const { user } = useAuth();
  const { history, currentResume } = useResume();

  const latestResume = history[0] || currentResume;
  const totalAnalyzed = history.length;
  const avgAts = Math.round(history.reduce((acc, h) => acc + (h.atsScore || 85), 0) / (totalAnalyzed || 1));
  const avgJobMatch = Math.round(history.reduce((acc, h) => acc + (h.jobMatchScore || 78), 0) / (totalAnalyzed || 1));

  const recentActivities = [
    { title: 'Scanned Alex_Morgan_Senior_Engineer_2026.pdf', time: '10 minutes ago', type: 'scan', score: 89 },
    { title: 'Matched against Stripe Senior Full Stack Engineer role', time: '12 minutes ago', type: 'match', score: 78 },
    { title: 'Applied 3 AI suggestions to Professional Summary', time: 'Yesterday', type: 'edit' },
    { title: 'Compared Version 1 with Version 2 (+12% improvement)', time: '2 days ago', type: 'compare' }
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Welcome Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span className="badge badge-brand">Candidate Dashboard</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user?.plan || 'Pro Account'}</span>
              </div>
              <h1 style={{ fontSize: '1.95rem', fontWeight: 800 }}>
                Welcome back, {user?.name ? user.name.split(' ')[0] : 'Engineer'}!
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
                Here is a summary of your resume ATS performance and career matching metrics.
              </p>
            </div>

            <Link to="/upload" className="btn btn-primary">
              <UploadCloud size={16} /> Upload New Resume
            </Link>
          </div>

          {/* 4 Top KPI Stat Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '1.25rem'
            }}
          >
            {/* KPI 1: Resumes Analyzed */}
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                  Resumes Analyzed
                </span>
                <FileCheck2 size={18} color="var(--brand-primary)" />
              </div>
              <div style={{ fontSize: '2.1rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                {totalAnalyzed}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                All versions stored locally
              </div>
            </div>

            {/* KPI 2: Average Overall Score */}
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                  Average Overall Score
                </span>
                <Award size={18} color="#6366f1" />
              </div>
              <div style={{ fontSize: '2.1rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--brand-primary)' }}>
                88%
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <TrendingUp size={14} /> +12% since first upload
              </div>
            </div>

            {/* KPI 3: Average ATS Score */}
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                  Average ATS Score
                </span>
                <ShieldCheck size={18} color="var(--success)" />
              </div>
              <div style={{ fontSize: '2.1rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--success)' }}>
                {avgAts}%
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Top 8% candidate percentile
              </div>
            </div>

            {/* KPI 4: Job Match Average */}
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                  Average Job Match
                </span>
                <Sparkles size={18} color="var(--brand-cyan)" />
              </div>
              <div style={{ fontSize: '2.1rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--brand-cyan)' }}>
                {avgJobMatch}%
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Role parity across applications
              </div>
            </div>
          </div>

          {/* Latest Resume Analysis Feature Card */}
          {latestResume && (
            <div
              className="gradient-border-card"
              style={{
                padding: '2rem',
                background: 'var(--bg-glass-card)',
                backdropFilter: 'blur(16px)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '2rem',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span className="badge badge-brand">Latest Scanned Document</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{latestResume.date || 'Recent'}</span>
                </div>
                <h3 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  {latestResume.fileName}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                  Targeted for <strong>{latestResume.targetJobTitle || 'Software Engineer'}</strong> {latestResume.targetCompany && `at ${latestResume.targetCompany}`}. Passed formatting compatibility with strong technical keyword density.
                </p>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <Link to={`/analysis/${latestResume.id}`} className="btn btn-primary btn-sm">
                    Open Full Report <ArrowRight size={15} />
                  </Link>
                  <Link to={`/ats-analysis/${latestResume.id}`} className="btn btn-secondary btn-sm">
                    ATS Audit
                  </Link>
                  <Link to="/compare" className="btn btn-outline btn-sm">
                    Compare Versions
                  </Link>
                </div>
              </div>

              {/* Quick Gauges */}
              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: '1rem' }}>
                <CircularProgress
                  score={latestResume.overallScore || 84}
                  max={100}
                  size={120}
                  label="Overall"
                  color="#6366f1"
                />
                <CircularProgress
                  score={latestResume.atsScore || 89}
                  max={100}
                  size={120}
                  label="ATS Score"
                  color="#10b981"
                />
                {latestResume.jobMatchScore && (
                  <CircularProgress
                    score={latestResume.jobMatchScore}
                    max={100}
                    size={120}
                    label="Job Match"
                    color="#06b6d4"
                  />
                )}
              </div>
            </div>
          )}

          {/* Activity Timeline & Quick Suggestions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {/* Recent Activity */}
            <div className="glass-panel" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <Clock size={18} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Recent Activity</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {recentActivities.map((act, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      paddingBottom: '0.75rem',
                      borderBottom: idx < recentActivities.length - 1 ? '1px solid var(--border-subtle)' : 'none'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {act.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {act.time}
                      </div>
                    </div>
                    {act.score && <ScoreBadge score={act.score} size="sm" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Improvement Tips */}
            <div className="glass-panel" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <Sparkles size={18} color="#f59e0b" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Top Quick Recommendations</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ padding: '0.85rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--brand-primary)', marginBottom: '0.2rem' }}>
                    1. Add Container Orchestration
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Add Docker and Kubernetes keywords to your technical skills to unlock Senior DevOps requirements.
                  </p>
                </div>

                <div style={{ padding: '0.85rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--success)', marginBottom: '0.2rem' }}>
                    2. Quantify Checkout Performance
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Include the "42% latency reduction" figure in your lead project bullet point.
                  </p>
                </div>

                <div style={{ padding: '0.85rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--brand-cyan)', marginBottom: '0.2rem' }}>
                    3. Target Job Description Sync
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Always paste the exact job post before applying to recalculate semantic alignment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
