import React from 'react';

export default function SkeletonLoader({ type = 'card', count = 1 }) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (type === 'card') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
        {items.map(i => (
          <div
            key={i}
            className="glass-panel shimmer-effect"
            style={{ height: '140px', borderRadius: 'var(--radius-lg)' }}
          />
        ))}
      </div>
    );
  }

  if (type === 'circle') {
    return (
      <div
        className="shimmer-effect"
        style={{ width: '130px', height: '130px', borderRadius: '50%', margin: '0 auto' }}
      />
    );
  }

  if (type === 'text') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
        {items.map(i => (
          <div
            key={i}
            className="shimmer-effect"
            style={{ height: '16px', borderRadius: '4px', width: i % 2 === 0 ? '100%' : '75%' }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className="glass-panel shimmer-effect"
      style={{ height: '240px', width: '100%', borderRadius: 'var(--radius-lg)' }}
    />
  );
}
