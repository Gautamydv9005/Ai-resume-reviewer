import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import {
  LayoutDashboard,
  UploadCloud,
  FileText,
  CheckCircle,
  Briefcase,
  Sparkles,
  Edit3,
  History,
  GitCompare,
  UserCheck,
  FileCheck2
} from 'lucide-react';
import { useResume } from '../../context/ResumeContext';

export default function Sidebar() {
  const { currentResumeId, currentResume, resumeList, selectResume } = useResume();
  const params = useParams();
  const activeId = params.resumeId || currentResumeId || 'res_001';

  const menuSections = [
    {
      title: 'Main',
      items: [
        { label: 'Overview Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Upload New Resume', path: '/upload', icon: UploadCloud }
      ]
    },
    {
      title: 'Active Analysis',
      items: [
        { label: 'Score Overview', path: `/analysis/${activeId}`, icon: FileText },
        { label: 'ATS Analysis', path: `/ats-analysis/${activeId}`, icon: CheckCircle },
        { label: 'Job Match Analysis', path: `/job-match/${activeId}`, icon: Briefcase },
        { label: 'AI Feedback', path: `/analysis/${activeId}/feedback`, icon: Sparkles },
        { label: 'Improvement Diffs', path: `/analysis/${activeId}/improvements`, icon: Edit3 }
      ]
    },
    {
      title: 'Management',
      items: [
        { label: 'Resume History', path: '/resume-history', icon: History },
        { label: 'Version Compare', path: '/compare', icon: GitCompare },
        { label: 'Profile & Settings', path: '/profile', icon: UserCheck }
      ]
    }
  ];

  return (
    <aside className="dashboard-sidebar">
      <div>
        {/* Active Resume Selector Widget */}
        <div className="sidebar-widget" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
            <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.06em' }}>
              Active Resume
            </span>
            <span className="badge badge-brand" style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>
              {currentResume?.status || 'Analyzed'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.55rem' }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: 'var(--brand-primary-light)',
                color: 'var(--brand-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <FileCheck2 size={16} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
                title={currentResume?.fileName}
              >
                {currentResume?.fileName || 'Resume.pdf'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Score: <strong style={{ color: 'var(--brand-primary)' }}>{currentResume?.overallScore || 85}%</strong>
              </div>
            </div>
          </div>

          {/* Quick Resume Switcher */}
          {resumeList.length > 1 && (
            <select
              value={currentResumeId}
              onChange={(e) => selectResume(e.target.value)}
              className="form-select"
              style={{
                fontSize: '0.75rem',
                padding: '0.4rem 0.6rem',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                cursor: 'pointer'
              }}
              aria-label="Switch active resume"
            >
              {resumeList.map(r => (
                <option key={r.id} value={r.id}>
                  {r.fileName.length > 22 ? r.fileName.substring(0, 19) + '...' : r.fileName} ({r.overallScore || 80}%)
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Navigation Sections */}
        {menuSections.map((section, idx) => (
          <div key={idx} style={{ marginBottom: '1.35rem' }}>
            <div
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                padding: '0 0.5rem 0.45rem 0.5rem'
              }}
            >
              {section.title}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {section.items.map(({ label, path, icon: Icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={path === `/analysis/${activeId}`}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                >
                  <span className="sidebar-icon-wrap">
                    <Icon size={17} />
                  </span>
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pro Help / Microservice Footer Info */}
      <div className="sidebar-tip-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem', fontSize: '0.8rem' }}>
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '6px',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f59e0b',
              flexShrink: 0
            }}
          >
            <Sparkles size={12} />
          </div>
          Instant Score Boost
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.74rem', lineHeight: 1.45 }}>
          Apply the AI suggestions diffs to increase your ATS rating by up to 15%.
        </p>
      </div>
    </aside>
  );
}
