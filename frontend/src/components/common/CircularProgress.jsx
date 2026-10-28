import React from 'react';

export default function CircularProgress({
  score = 0,
  max = 100,
  size = 140,
  strokeWidth = 10,
  label = '',
  subtitle = '',
  color = null // optional custom stroke color
}) {
  const isNullScore = score === null || score === undefined;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedScore = isNullScore ? 0 : Math.min(Math.max(score, 0), max);
  const strokeDashoffset = isNullScore ? circumference : circumference - (normalizedScore / max) * circumference;

  // Determine stroke color based on score if not explicitly passed
  let strokeColor = color;
  if (!strokeColor) {
    if (isNullScore) strokeColor = '#64748b';
    else if (normalizedScore >= 80) strokeColor = '#10b981'; // Emerald
    else if (normalizedScore >= 65) strokeColor = '#f59e0b'; // Amber
    else strokeColor = '#f43f5e'; // Rose
  }

  const gradientId = isNullScore ? `circ-grad-na-${size}` : `circ-grad-${Math.floor(score)}-${size}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={strokeColor} />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="var(--bg-tertiary)"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)',
              filter: `drop-shadow(0 0 6px ${strokeColor}66)`
            }}
          />
        </svg>

        {/* Center Text */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}
        >
          <span
            style={{
              fontSize: size > 120 ? '2rem' : '1.35rem',
              fontWeight: 800,
              fontFamily: 'var(--font-sans)',
              color: isNullScore ? 'var(--text-muted)' : 'var(--text-primary)',
              lineHeight: 1
            }}
          >
            {isNullScore ? 'N/A' : normalizedScore}
            {!isNullScore && (
              <span style={{ fontSize: size > 120 ? '1rem' : '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                /{max}
              </span>
            )}
          </span>
          {subtitle && (
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                fontWeight: 600,
                marginTop: '4px'
              }}
            >
              {subtitle}
            </span>
          )}
        </div>
      </div>

      {label && (
        <span
          style={{
            marginTop: '0.75rem',
            fontSize: '0.9rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '0.01em'
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
