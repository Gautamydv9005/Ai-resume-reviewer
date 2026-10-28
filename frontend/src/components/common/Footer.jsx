import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, FileCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-default)',
        padding: '3rem 0 2rem 0',
        marginTop: 'auto'
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem',
            marginBottom: '2.5rem'
          }}
        >
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--brand-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}
              >
                <Sparkles size={17} />
              </div>
              <span style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                ResuMate<span className="text-gradient">.AI</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, maxWidth: '520px' }}>
              AI-powered ATS resume analyzer and job-matching engine designed for high-caliber job seekers.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className="badge badge-brand">
              <FileCheck size={12} />
              PDF & DOCX Support
            </span>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid var(--border-default)',
            paddingTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.825rem',
            color: 'var(--text-muted)'
          }}
        >
          <div>© {new Date().getFullYear()} ResuMate AI Inc. All rights reserved.</div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="/profile" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
              Profile Settings
            </Link>
            <Link to="/resume-history" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
              Resume History
            </Link>
            <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
              Privacy & Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
