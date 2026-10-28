import React from 'react';
import { FileQuestion, UploadCloud } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({
  icon: Icon = FileQuestion,
  title = 'No Resume Found',
  description = 'Upload your resume to get started with an AI-powered ATS analysis.',
  actionText = 'Upload Resume',
  actionLink = '/upload'
}) {
  return (
    <div
      className="glass-panel"
      style={{
        padding: '3.5rem 2rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        maxWidth: '540px',
        margin: '2rem auto'
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'var(--brand-primary-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--brand-primary)'
        }}
      >
        <Icon size={32} />
      </div>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', fontSize: '0.925rem' }}>
        {description}
      </p>

      {actionLink && (
        <Link to={actionLink} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
          <UploadCloud size={18} />
          {actionText}
        </Link>
      )}
    </div>
  );
}
