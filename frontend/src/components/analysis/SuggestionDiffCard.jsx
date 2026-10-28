import React, { useState } from 'react';
import { Copy, Check, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function SuggestionDiffCard({ improvement }) {
  const { section, sectionTitle, original, suggested, rationale } = improvement;
  const [copied, setCopied] = useState(false);
  const [applied, setApplied] = useState(false);
  const { addToast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(suggested);
      setCopied(true);
      addToast({
        message: `Copied AI suggestion for ${section} to clipboard!`,
        type: 'success',
        duration: 3000
      });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleApplyToggle = () => {
    setApplied(prev => !prev);
    addToast({
      message: applied
        ? `Reverted changes for ${section}`
        : `Marked ${section} suggestion as applied to your draft!`,
      type: applied ? 'info' : 'success',
      duration: 3000
    });
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        borderLeft: applied ? '4px solid var(--success)' : '4px solid var(--brand-primary)',
        transition: 'all var(--transition-normal)'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-brand">{section}</span>
            {applied && (
              <span className="badge badge-success">
                <CheckCircle2 size={12} /> Applied to Draft
              </span>
            )}
          </div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '0.35rem', color: 'var(--text-primary)' }}>
            {sectionTitle}
          </h4>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={handleCopy}
            className="btn btn-secondary btn-sm"
            title="Copy suggestion to clipboard"
          >
            {copied ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy Suggestion'}</span>
          </button>
          <button
            onClick={handleApplyToggle}
            className={`btn btn-sm ${applied ? 'btn-outline' : 'btn-primary'}`}
          >
            {applied ? 'Undo' : 'Mark Applied'}
          </button>
        </div>
      </div>

      {/* Comparison Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem'
        }}
      >
        {/* Original */}
        <div
          style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Current Resume Version
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            "{original}"
          </p>
        </div>

        {/* AI Suggested */}
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid var(--success-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <Sparkles size={13} /> AI Optimized Replacement
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.55 }}>
            "{suggested}"
          </p>
        </div>
      </div>

      {/* AI Rationale */}
      {rationale && (
        <div
          style={{
            fontSize: '0.825rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '0.75rem'
          }}
        >
          <strong style={{ color: 'var(--text-secondary)' }}>Why this works better:</strong>
          <span>{rationale}</span>
        </div>
      )}
    </div>
  );
}
