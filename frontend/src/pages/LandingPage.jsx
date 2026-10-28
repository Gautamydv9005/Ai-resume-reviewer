import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  FileCheck,
  Cpu,
  BarChart3,
  Layers,
  Search,
  Zap,
  Target,
  FileText,
  Star
} from 'lucide-react';
import CircularProgress from '../components/common/CircularProgress';

export default function LandingPage() {
  const features = [
    {
      icon: Cpu,
      title: 'AI Resume Scoring',
      description: 'Comprehensive section-by-section breakdown evaluating structure, tone, impact metrics, and clarity.'
    },
    {
      icon: ShieldCheck,
      title: 'Enterprise ATS Compatibility',
      description: 'Tested against parsing algorithms used in Workday, Greenhouse, Lever, and Taleo to avoid auto-rejection.'
    },
    {
      icon: Target,
      title: 'Job Description Match',
      description: 'Compare your resume directly against specific job posts to uncover high-priority missing skills and keywords.'
    },
    {
      icon: Zap,
      title: 'Actionable Rewrites & Diffs',
      description: 'Get instant, ready-to-paste bullet point enhancements powered by top tech recruiter rubrics.'
    },
    {
      icon: Layers,
      title: 'Version Comparison',
      description: 'Track your resume evolution across revisions and see tangible score leaps side-by-side.'
    },
    {
      icon: FileCheck,
      title: 'Multi-Format Support',
      description: 'Parse both PDF and DOCX documents with automated layout validation and formatting audits.'
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Upload Your Resume',
      desc: 'Drag and drop your PDF or DOCX file. Optionally paste the target job description.'
    },
    {
      step: '02',
      title: 'Deep AI & ATS Scan',
      desc: 'Our scoring engine parses your sections, detects keyword matches, and inspects layout hierarchy.'
    },
    {
      step: '03',
      title: 'Review & Boost Scores',
      desc: 'Apply one-click AI improvement suggestions to maximize your interview conversion rate.'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem', paddingBottom: '4rem' }}>
      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          paddingTop: '4.5rem',
          paddingBottom: '3.5rem',
          overflow: 'hidden'
        }}
      >
        {/* Background glow radial */}
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(139, 92, 246, 0.05) 50%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          {/* Top Pill */}
          <div
            className="animate-fade-in"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1rem',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-glass-card)',
              border: '1px solid var(--border-default)',
              marginBottom: '1.75rem',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <Sparkles size={16} color="var(--brand-primary)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Next-Gen AI Resume & ATS Reviewer
            </span>
          </div>

          {/* Main Headline */}
          <h1
            className="animate-fade-in"
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4.2rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              maxWidth: '960px',
              margin: '0 auto 1.5rem auto',
              letterSpacing: '-0.03em'
            }}
          >
            Make Your Resume <span className="text-gradient">AI-Ready</span> and{' '}
            <span className="text-cyan-gradient">Job-Ready</span>
          </h1>

          {/* Subtitle */}
          <p
            className="animate-fade-in"
            style={{
              fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
              color: 'var(--text-secondary)',
              maxWidth: '720px',
              margin: '0 auto 2.5rem auto',
              lineHeight: 1.6
            }}
          >
            Upload your resume, get an AI-powered analysis, identify weaknesses, discover missing keywords, and improve your chances of passing ATS screening.
          </p>

          {/* CTA Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
              marginBottom: '3.5rem'
            }}
          >
            <Link to="/upload" className="btn btn-primary btn-lg" style={{ minWidth: '200px' }}>
              <Sparkles size={18} />
              Review My Resume
              <ArrowRight size={18} />
            </Link>
            <Link to="/analysis/res_001" className="btn btn-secondary btn-lg">
              Explore Live Demo
            </Link>
          </div>

          {/* Hero Interactive Preview Card */}
          <div
            className="glass-panel animate-scale-in"
            style={{
              maxWidth: '860px',
              margin: '0 auto',
              padding: '2rem',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-strong)',
              boxShadow: 'var(--shadow-xl), 0 0 40px rgba(99, 102, 241, 0.15)',
              position: 'relative'
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '2rem',
                alignItems: 'center'
              }}
            >
              {/* Overall Score Meter */}
              <div style={{ padding: '1rem', borderRight: '1px solid var(--border-subtle)' }}>
                <CircularProgress score={84} max={100} size={135} label="Overall Score" subtitle="Strong Candidate" />
              </div>

              {/* ATS Score Meter */}
              <div style={{ padding: '1rem', borderRight: '1px solid var(--border-subtle)' }}>
                <CircularProgress score={89} max={100} size={135} label="ATS Score" subtitle="98% Parse Rate" color="#10b981" />
              </div>

              {/* Job Match Meter */}
              <div style={{ padding: '1rem' }}>
                <CircularProgress score={78} max={100} size={135} label="Job Match" subtitle="Stripe Senior Eng" color="#38bdf8" />
              </div>
            </div>

            {/* Quick Metrics Banner */}
            <div
              style={{
                marginTop: '1.75rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                flexWrap: 'wrap',
                gap: '1rem',
                fontSize: '0.85rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                <CheckCircle size={16} color="var(--success)" />
                <span>36 Matched Keywords</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                <ShieldCheck size={16} color="var(--brand-primary)" />
                <span>Zero ATS Format Warnings</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                <Sparkles size={16} color="#f59e0b" />
                <span>5 Instant AI Enhancements</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="badge badge-brand" style={{ marginBottom: '0.75rem' }}>
            Seamless Workflow
          </span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800 }}>How It Works</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '550px', margin: '0.5rem auto 0 auto' }}>
            Go from an unoptimized resume to an interview magnet in three streamlined steps.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.75rem'
          }}
        >
          {steps.map((s, idx) => (
            <div
              key={idx}
              className="glass-panel"
              style={{
                padding: '2rem',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}
            >
              <div
                style={{
                  fontSize: '2.25rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--brand-primary)',
                  opacity: 0.8
                }}
              >
                {s.step}
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{s.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6 }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="badge badge-brand" style={{ marginBottom: '0.75rem' }}>
            Engineered For Excellence
          </span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Everything You Need to Get Hired</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0.5rem auto 0 auto' }}>
            Built around the exact screening criteria top tech recruiters and enterprise ATS systems evaluate.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}
        >
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="glass-panel-interactive"
                style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--brand-primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--brand-primary)'
                  }}
                >
                  <Icon size={22} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{feat.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.55 }}>
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Supported Resume Formats Section */}
      <section className="container">
        <div
          className="gradient-border-card"
          style={{
            padding: '3rem 2rem',
            background: 'var(--bg-glass-card)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '2rem'
          }}
        >
          <div style={{ maxWidth: '580px' }}>
            <span className="badge badge-brand" style={{ marginBottom: '0.75rem' }}>
              Universal Compatibility
            </span>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.75rem' }}>
              Supported Resume Formats
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Whether you build your resume in LaTeX, Google Docs, Microsoft Word, or Figma, our parsers ingest both PDF and DOCX files without layout scrambling.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div
              className="glass-panel"
              style={{
                padding: '1.25rem 1.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                minWidth: '180px'
              }}
            >
              <FileText size={32} color="#f43f5e" />
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>PDF</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Adobe Acrobat (.pdf)</div>
              </div>
            </div>

            <div
              className="glass-panel"
              style={{
                padding: '1.25rem 1.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                minWidth: '180px'
              }}
            >
              <FileCheck size={32} color="#38bdf8" />
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>DOCX</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Microsoft Word (.docx)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="container">
        <div
          className="glass-panel"
          style={{
            padding: '3.5rem 2rem',
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 50%, rgba(6, 182, 212, 0.1) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: 'var(--radius-xl)'
          }}
        >
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '1rem' }}>
            Ready to Land More Interviews?
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '580px', margin: '0 auto 2rem auto', fontSize: '1.05rem' }}>
            Upload your resume now and get your comprehensive ATS and job match report in seconds.
          </p>
          <Link to="/upload" className="btn btn-primary btn-lg">
            <Sparkles size={18} />
            Review My Resume Now
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
