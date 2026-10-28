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
        <div
          style={{
            padding: '0.85rem',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
              Active Resume
            </span>
            <span className="badge badge-brand" style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}>
              {currentResume?.status || 'Analyzed'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <FileCheck2 size={16} color="var(--brand-primary)" style={{ flexShrink: 0 }} />
            <span
              style={{
                fontSize: '0.825rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
              title={currentResume?.fileName}
            >
              {currentResume?.fileName || 'Resume.pdf'}
            </span>
          </div>

          {/* Quick Resume Switcher */}
          {resumeList.length > 1 && (
            <select
              value={currentResumeId}
              onChange={(e) => selectResume(e.target.value)}
              className="form-select"
              style={{
                fontSize: '0.75rem',
                padding: '0.35rem 0.5rem',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-sm)'
              }}
              aria-label="Switch active resume"
            >
              {resumeList.map(r => (
                <option key={r.id} value={r.id}>
                  {r.fileName.length > 22 ? r.fileName.substring(0, 19) + '...' : r.fileName} (Score: {r.overallScore || 80})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Navigation Sections */}
        {menuSections.map((section, idx) => (
          <div key={idx} style={{ marginBottom: '1.25rem' }}>
            <div
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                padding: '0 0.5rem 0.4rem 0.5rem'
              }}
            >
              {section.title}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              {section.items.map(({ label, path, icon: Icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={path === `/analysis/${activeId}`}
                  className={({ isActive }) =>
                    `tab-btn ${isActive ? 'active' : ''}`
                  }
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.55rem 0.75rem',
                    fontSize: '0.85rem',
                    textDecoration: 'none',
                    borderRadius: 'var(--radius-md)',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    background: isActive ? 'var(--brand-primary)' : 'transparent',
                    transition: 'all var(--transition-fast)'
                  })}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pro Help / Microservice Footer Info */}
      <div
        style={{
          padding: '0.85rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          <Sparkles size={14} color="#f59e0b" /> Need an instant boost?
        </div>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.4 }}>
          Apply the AI suggestions diffs to increase your ATS rating by up to 15%.
        </p>
      </div>
    </aside>
  );
}
