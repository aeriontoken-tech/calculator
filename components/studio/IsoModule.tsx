'use client';

import { motion } from 'motion/react';
import type { EnergyType } from '@/lib/presets';
import { Icon } from './primitives';

const K = 30;
const W = 2.25; // along x
const D = 1.45; // along y (depth)
const H = 1.5; // height (z)
const CX = 116;
const CY = 118;

function iso(x: number, y: number, z: number): [number, number] {
  return [CX + (x - y) * K * 0.866, CY + (x + y) * K * 0.5 - z * K];
}
const P = (a: [number, number][]) => a.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');

const TINT: Record<EnergyType, { roof: string; accent: string; icon: string }> = {
  wind: { roof: '#e7e2d5', accent: '#8be3a0', icon: 'wind' },
  solar: { roof: '#ece6d4', accent: '#cfe8a6', icon: 'solar' },
  mixed: { roof: '#e6e1d3', accent: '#7fce9b', icon: 'mixed' },
  custom: { roof: '#e8e3d7', accent: '#9fd9c0', icon: 'custom' },
};

export function IsoModule({
  energyType,
  uptime,
  minerCount,
}: {
  energyType: EnergyType;
  uptime: number;
  minerCount: number;
}) {
  const tint = TINT[energyType];

  // visible faces: top (z=H), left (y=D, front-left), right (x=W, front-right)
  const top = P([iso(0, 0, H), iso(W, 0, H), iso(W, D, H), iso(0, D, H)]);
  const left = P([iso(0, D, 0), iso(W, D, 0), iso(W, D, H), iso(0, D, H)]); // the lit "door" face
  const right = P([iso(W, 0, 0), iso(W, D, 0), iso(W, D, H), iso(W, 0, H)]); // shadowed side
  const baseC = iso(W / 2, D / 2, 0);

  // louvers + LED grid on the front-left (y=D) face
  const louvers = Array.from({ length: 6 }, (_, i) => {
    const z = 0.18 + i * 0.22;
    return P([iso(0.12, D, z), iso(W - 0.12, D, z)]);
  });
  const cols = 6;
  const rows = 2;
  const totalLed = cols * rows;
  const lit = Math.round(uptime * totalLed);
  const leds: { p: [number, number]; on: boolean }[] = [];
  let k = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = 0.28 + (c / (cols - 1)) * (W - 0.56);
      const z = 0.55 + r * 0.42;
      leds.push({ p: iso(x, D, z), on: k < lit });
      k++;
    }
  }
  // door outline on the right (x=W) face
  const door = P([iso(W, 0.3, 0.05), iso(W, 1.05, 0.05), iso(W, 1.05, 1.15), iso(W, 0.3, 1.15)]);
  // vents across the roof
  const vents = Array.from({ length: 5 }, (_, i) => {
    const x = ((i + 1) / 6) * W;
    return P([iso(x, 0.15, H), iso(x, D - 0.15, H)]);
  });

  const badge = iso(0.1, 0, H); // back-top area for the energy chip

  return (
    <svg viewBox="0 0 236 210" width="100%" height="100%" aria-hidden style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`fl-${energyType}`} x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0" stopColor="#5f8d6b" />
          <stop offset="1" stopColor="#3d6249" />
        </linearGradient>
        <linearGradient id="roofg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f4f0e7" />
          <stop offset="1" stopColor={tint.roof} />
        </linearGradient>
        <radialGradient id="sh" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="rgba(31,45,33,0.3)" />
          <stop offset="1" stopColor="rgba(31,45,33,0)" />
        </radialGradient>
      </defs>

      <ellipse cx={baseC[0]} cy={baseC[1] + 20} rx="80" ry="21" fill="url(#sh)" />

      <motion.g
        initial={{ y: 0 }}
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* roof */}
        <polygon points={top} fill="url(#roofg)" stroke="rgba(47,79,56,0.2)" strokeWidth="1" />
        {vents.map((v, i) => (
          <polyline key={i} points={v} fill="none" stroke="rgba(47,79,56,0.16)" strokeWidth="1.4" />
        ))}

        {/* right (shadowed) face */}
        <polygon points={right} fill="#2c4a36" />
        <polygon points={door} fill="rgba(15,25,18,0.35)" stroke="rgba(10,18,12,0.5)" strokeWidth="1" />

        {/* left (lit) face with louvers + LEDs */}
        <polygon points={left} fill={`url(#fl-${energyType})`} />
        {louvers.map((l, i) => (
          <polyline key={i} points={l} fill="none" stroke="rgba(16,26,18,0.24)" strokeWidth="1" />
        ))}
        {leds.map((l, i) => (
          <motion.circle
            key={i}
            cx={l.p[0]}
            cy={l.p[1]}
            r="2.7"
            fill={l.on ? 'var(--mint)' : 'rgba(16,26,18,0.22)'}
            animate={l.on ? { opacity: [0.5, 1, 0.5] } : { opacity: 1 }}
            transition={l.on ? { duration: 2.6, repeat: Infinity, delay: (i % 5) * 0.16, ease: 'easeInOut' } : { duration: 0 }}
            style={l.on ? { filter: 'drop-shadow(0 0 3px rgba(139,227,160,0.95))' } : undefined}
          />
        ))}

        {/* mint accent along the two leading roof edges */}
        <polyline points={P([iso(0, D, H), iso(W, D, H)])} fill="none" stroke={tint.accent} strokeWidth="2.5" />
        <polyline points={P([iso(W, 0, H), iso(W, D, H)])} fill="none" stroke={tint.accent} strokeWidth="2.5" opacity="0.6" />
      </motion.g>

      {/* energy badge */}
      <motion.g
        initial={{ y: 0 }}
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
      >
        <circle cx={badge[0] + 8} cy={badge[1] - 12} r="16" fill="var(--glass-2)" stroke="var(--line-strong)" />
        <g transform={`translate(${badge[0]}, ${badge[1] - 20})`} style={{ color: 'var(--deep-sage)' }}>
          <Icon name={tint.icon} size={16} />
        </g>
      </motion.g>

      {/* fleet badge */}
      <g>
        <rect x="6" y="8" width="58" height="23" rx="11.5" fill="var(--glass-2)" stroke="var(--line)" />
        <text x="35" y="23.5" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill="var(--ink)">
          × {minerCount}
        </text>
      </g>
    </svg>
  );
}
