'use client';

import { motion } from 'motion/react';
import type { CashPoint } from '@/lib/studio';

export function CashflowCurve({ cashflow, height = 150 }: { cashflow: CashPoint[]; height?: number }) {
  const W = 460;
  const pad = 14;
  const months = cashflow.length;
  if (months < 2) return <svg viewBox={`0 0 ${W} ${height}`} width="100%" />;
  const vals = cashflow.map((p) => p.cumulative);
  const min = Math.min(...vals, 0);
  const max = Math.max(...vals, 0);
  const x = (m: number) => pad + ((m - 1) / (months - 1)) * (W - 2 * pad);
  const y = (v: number) => height - pad - ((v - min) / (max - min || 1)) * (height - 2 * pad);
  const zeroY = y(0);
  const line = cashflow.map((p) => `${x(p.month).toFixed(1)},${y(p.cumulative).toFixed(1)}`).join(' ');
  const area = `${x(1).toFixed(1)},${zeroY.toFixed(1)} ${line} ${x(months).toFixed(1)},${zeroY.toFixed(1)}`;
  const be = cashflow.find((p) => p.cumulative >= 0);
  const positive = (cashflow[months - 1]?.cumulative ?? 0) >= 0;

  return (
    <svg viewBox={`0 0 ${W} ${height + 16}`} width="100%" height="auto" role="img" aria-label="Cumulative cash flow over the horizon">
      <defs>
        <linearGradient id="cf-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgba(139,227,160,0.42)" />
          <stop offset={`${((zeroY - pad) / (height - 2 * pad)) * 100}%`} stopColor="rgba(139,227,160,0.06)" />
          <stop offset="100%" stopColor="rgba(176,106,90,0.16)" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#cf-fill)" />
      <line x1={pad} y1={zeroY} x2={W - pad} y2={zeroY} stroke="var(--line-strong)" strokeDasharray="2 3" />
      <motion.polyline
        points={line}
        fill="none"
        stroke={positive ? 'var(--deep-sage)' : '#b06a5a'}
        strokeWidth="2.2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      />
      {be && (
        <g>
          <line x1={x(be.month)} y1={pad} x2={x(be.month)} y2={height - pad} stroke="var(--mint-ink)" strokeDasharray="3 3" opacity="0.6" />
          <circle cx={x(be.month)} cy={zeroY} r="4.5" fill="var(--mint-ink)" stroke="var(--paper-3)" strokeWidth="2" />
          <text x={x(be.month)} y={height + 12} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--mint-ink)">
            breakeven · {be.month}mo
          </text>
        </g>
      )}
      <text x={pad} y={height + 12} fontFamily="var(--font-mono)" fontSize="9" fill="var(--ink-faint)">
        −capex
      </text>
      <text x={W - pad} y={height + 12} textAnchor="end" fontFamily="var(--font-mono)" fontSize="9" fill="var(--ink-faint)">
        {months}mo
      </text>
    </svg>
  );
}
