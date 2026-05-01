import React from 'react';

/* ── BAR CHART ── */
export function BarChart({ data = [], color = 'var(--blue)', height = 120, showLabels = true }) {
  if (!data.length) return <div style={{ height }} />;
  const max = Math.max(...data.map(d => d.value || d.v || 0), 1);
  const bw = 100 / data.length;
  const gap = 0.5;
  const labelH = showLabels ? 16 : 4;

  return (
    <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" style={{ width: '100%', height }}>
      {data.map((d, i) => {
        const val = d.value || d.v || 0;
        const bh = ((val / max) * (height - labelH - 4));
        const x = i * bw + gap;
        const w = bw - gap * 2;
        const y = height - bh - labelH;
        const lbl = d.label || d.l || d.m || d.d || '';
        return (
          <g key={i}>
            <rect x={x} y={y} width={w} height={Math.max(bh, 0)} fill={color} rx="1.5" opacity="0.88" />
            {showLabels && (
              <text x={x + w / 2} y={height - 3} textAnchor="middle" fontSize="4" fill="var(--text3)">{lbl}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ── LINE CHART ── */
export function LineChart({ data = [], color = 'var(--blue)', height = 110, fill = true }) {
  if (data.length < 2) return <div style={{ height }} />;
  const values = data.map(d => d.value || d.v || d.amount || 0);
  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  const range = max - min || 1;
  const W = 100;
  const H = height - 12;
  const step = W / (data.length - 1);

  const pts = data.map((d, i) => ({
    x: i * step,
    y: H - ((( d.value || d.v || d.amount || 0) - min) / range) * H,
  }));

  const path = pts.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const cp = (pts[i - 1].x + p.x) / 2;
    return `${acc} C ${cp} ${pts[i - 1].y}, ${cp} ${p.y}, ${p.x} ${p.y}`;
  }, '');

  const area = `${path} L ${pts[pts.length - 1].x} ${H} L 0 ${H} Z`;
  const gid = `g${color.replace(/[^a-z0-9]/gi, '')}`;

  return (
    <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" style={{ width: '100%', height }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#${gid})`} />}
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ── DONUT ── */
export function DonutChart({ value = 0, total = 100, color = 'var(--blue)', size = 90 }) {
  const pct = total > 0 ? Math.min(1, value / total) : 0;
  const r = 32;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth="8" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`} style={{ transition: 'stroke-dasharray .5s ease' }} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="800" fill="var(--text)">
        {Math.round(pct * 100)}%
      </text>
    </svg>
  );
}

/* ── GROUPED BAR ── */
export function GroupedBar({ data = [], c1 = 'var(--blue)', c2 = 'var(--border)', height = 100 }) {
  if (!data.length) return <div style={{ height }} />;
  const max = Math.max(...data.flatMap(d => [d.a || 0, d.b || 0]), 1);
  const gw = 100 / data.length;
  const bw = gw * 0.34;
  const gap = gw * 0.05;
  const aH = height - 14;

  return (
    <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" style={{ width: '100%', height }}>
      {data.map((d, i) => {
        const x = i * gw;
        const h1 = ((d.a || 0) / max) * aH;
        const h2 = ((d.b || 0) / max) * aH;
        return (
          <g key={i}>
            <rect x={x + gap} y={aH - h1} width={bw} height={h1} fill={c1} rx="1" opacity="0.9" />
            <rect x={x + gap + bw + gap} y={aH - h2} width={bw} height={h2} fill={c2} rx="1" opacity="0.9" />
            {d.l && <text x={x + gw / 2} y={height - 2} textAnchor="middle" fontSize="4.5" fill="var(--text3)">{d.l}</text>}
          </g>
        );
      })}
    </svg>
  );
}
