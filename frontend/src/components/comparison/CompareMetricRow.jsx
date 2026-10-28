import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function CompareMetricRow({ label, score1, score2, unit = '%' }) {
  const delta = score2 - score1;
  const isPositive = delta > 0;
  const isZero = delta === 0;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 1.2fr',
        alignItems: 'center',
        padding: '1rem 1.25rem',
        borderBottom: '1px solid var(--border-subtle)',
        fontSize: '0.925rem'
      }}
    >
      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
        {label}
      </div>

      {/* Version 1 Score */}
      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-secondary)' }}>
        {score1}{unit}
      </div>

      {/* Version 2 Score */}
      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>
        {score2}{unit}
      </div>

      {/* Improvement Delta */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        {isZero ? (
          <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
            <Minus size={12} /> No Change
          </span>
        ) : (
          <span className={`badge ${isPositive ? 'badge-success' : 'badge-danger'}`}>
            {isPositive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {isPositive ? `+${delta}${unit}` : `${delta}${unit}`}
          </span>
        )}
      </div>
    </div>
  );
}
