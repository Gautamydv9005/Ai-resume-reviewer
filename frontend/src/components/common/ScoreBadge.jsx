import React from 'react';

export default function ScoreBadge({ score, label, size = 'md' }) {
  let badgeClass = 'badge-success';
  if (score < 65) badgeClass = 'badge-danger';
  else if (score < 80) badgeClass = 'badge-warning';

  const padding = size === 'sm' ? '0.2rem 0.5rem' : '0.3rem 0.75rem';
  const fontSize = size === 'sm' ? '0.75rem' : '0.85rem';

  return (
    <span
      className={`badge ${badgeClass}`}
      style={{ padding, fontSize, fontWeight: 700 }}
    >
      {label ? `${label}: ` : ''}{score}%
    </span>
  );
}
