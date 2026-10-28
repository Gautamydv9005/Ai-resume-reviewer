import React from 'react';
import { CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';

export default function FeedbackCard({ item, type = 'strength' }) {
  let Icon = CheckCircle2;
  let iconColor = 'var(--success)';
  let badgeClass = 'badge-success';

  if (type === 'weakness') {
    Icon = AlertTriangle;
    iconColor = 'var(--danger)';
    badgeClass = 'badge-danger';
  } else if (type === 'suggestion') {
    Icon = Lightbulb;
    iconColor = 'var(--brand-cyan)';
    badgeClass = 'badge-info';
  }

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.25rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-tertiary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon size={18} color={iconColor} />
          </div>
          <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {item.title}
          </h4>
        </div>

        {item.impact && (
          <span className={`badge ${badgeClass}`} style={{ fontSize: '0.7rem' }}>
            {item.impact}
          </span>
        )}
        {item.priority && (
          <span className="badge badge-brand" style={{ fontSize: '0.7rem' }}>
            {item.priority} Priority
          </span>
        )}
      </div>

      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        {item.description}
      </p>

      {item.action && (
        <div
          style={{
            marginTop: 'auto',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--brand-primary)',
            background: 'var(--brand-primary-light)',
            padding: '0.4rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            alignSelf: 'flex-start'
          }}
        >
          Recommended Action: {item.action}
        </div>
      )}
    </div>
  );
}
