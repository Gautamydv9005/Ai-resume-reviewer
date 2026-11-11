import React from 'react';
import { Check, AlertCircle, Sparkles } from 'lucide-react';
import ScoreBadge from '../common/ScoreBadge';

export default function SectionScoreCard({ section }) {
  const { name, score, status, items = [], suggestion } = section;

  return (
    <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {name}
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Status: <span style={{ color: 'var(--text-primary)' }}>{status}</span>
          </span>
          <ScoreBadge score={score} />
        </div>
      </div>

      {/* Score Progress Bar */}
      <div style={{ width: '100%', height: '6px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
        <div
          style={{
            width: `${score}%`,
            height: '100%',
            background: score >= 80 ? 'var(--success)' : score >= 65 ? 'var(--warning)' : 'var(--danger)',
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.8s ease-out'
          }}
        />
      </div>

      {/* Evaluated Checkpoints */}
      {items.length > 0 && (
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          {items.map((item, idx) => (
            <li
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)'
              }}
            >
              <Check size={16} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Suggestion Callout */}
      {suggestion && (
        <div className="ai-suggestion-box">
          <div className="ai-suggestion-header">
            <div className="ai-suggestion-icon-badge">
              <Sparkles size={13} strokeWidth={2.4} />
            </div>
            <span className="ai-suggestion-title">
              Actionable AI Suggestion
            </span>
          </div>
          <p className="ai-suggestion-text">
            {suggestion}
          </p>
        </div>
      )}
    </div>
  );
}
