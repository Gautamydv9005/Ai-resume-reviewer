import React from 'react';
import { Check, X, Sparkles } from 'lucide-react';

export default function KeywordChip({
  name,
  type = 'matched', // 'matched' | 'missing' | 'recommended'
  count = null,
  tip = null,
  onClick = null
}) {
  let chipClass = 'chip-matched';
  let Icon = Check;

  if (type === 'missing') {
    chipClass = 'chip-missing';
    Icon = X;
  } else if (type === 'recommended') {
    chipClass = 'chip-recommended';
    Icon = Sparkles;
  }

  return (
    <div
      className={`chip ${chipClass}`}
      title={tip || `${name} (${type})`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <Icon size={13} strokeWidth={2.5} />
      <span>{name}</span>
      {count && (
        <span
          style={{
            fontSize: '0.72rem',
            opacity: 0.8,
            marginLeft: '2px',
            background: 'rgba(0, 0, 0, 0.2)',
            padding: '1px 5px',
            borderRadius: '4px'
          }}
        >
          {count}x
        </span>
      )}
    </div>
  );
}
