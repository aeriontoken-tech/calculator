'use client';

import { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  DEFAULT_BOOST,
  LICENSE_CLASSES,
  accessShare,
  computeBoost,
  licenseForStake,
} from '@/packages/calc-engine';
import type { AccessState } from '@/lib/studio';
import { CountUp, Icon, RangeField } from './primitives';
import { Src } from './SourceTag';

const COMPETITOR = { stake: 10000, uptime: 0.9, reputation: 0.7, taskQuality: 0.7, eligible: true };

function BoostCurve({ stake, uptime, reputation, taskQuality, eligible }: { stake: number; uptime: number; reputation: number; taskQuality: number; eligible: boolean }) {
  const W = 460;
  const Hh = 140;
  const pad = 12;
  const maxStake = 200000;
  const samples = 60;
  const boostAt = (s: number) => computeBoost({ stake: s, uptime, reputation, taskQuality, eligible: true });
  // Fixed reference scale (ideal participant) so the curve visibly rises/falls
  // with uptime / reputation / task-quality, not just stake.
  const maxB = computeBoost({ stake: maxStake, uptime: 1, reputation: 1, taskQuality: 1, eligible: true }) || 1;
  const x = (s: number) => pad + (s / maxStake) * (W - 2 * pad);
  const y = (b: number) => Hh - pad - (b / maxB) * (Hh - 2 * pad);
  const line = Array.from({ length: samples + 1 }, (_, i) => {
    const s = (i / samples) * maxStake;
    return `${x(s).toFixed(1)},${y(boostAt(s)).toFixed(1)}`;
  }).join(' ');
  const ux = x(Math.min(stake, maxStake));
  const uy = y(boostAt(Math.min(stake, maxStake)));
  return (
    <svg viewBox={`0 0 ${W} ${Hh + 18}`} width="100%" height="auto" role="img" aria-label="Access weight versus ARN staked (concave)">
      <defs>
        <linearGradient id="boost-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgba(75,119,85,0.28)" />
          <stop offset="1" stopColor="rgba(75,119,85,0)" />
        </linearGradient>
      </defs>
      <line x1={pad} y1={Hh - pad} x2={W - pad} y2={Hh - pad} stroke="var(--line-strong)" />
      <polygon points={`${pad},${Hh - pad} ${line} ${W - pad},${Hh - pad}`} fill="url(#boost-fill)" />
      <polyline points={line} fill="none" stroke="var(--sage)" strokeWidth="2.2" />
      <motion.line x1={ux} y1={pad} x2={ux} y2={Hh - pad} stroke="var(--mint-ink)" strokeDasharray="3 3" animate={{ x1: ux, x2: ux }} />
      <motion.circle cx={ux} cy={uy} r="5" fill="var(--mint-ink)" stroke="var(--paper-3)" strokeWidth="2" animate={{ cx: ux, cy: uy }} style={!eligible ? { opacity: 0.3 } : undefined} />
      <text x={pad} y={Hh + 13} fontFamily="var(--font-mono)" fontSize="9" fill="var(--ink-faint)">0 ARN</text>
      <text x={W - pad} y={Hh + 13} textAnchor="end" fontFamily="var(--font-mono)" fontSize="9" fill="var(--ink-faint)">200k staked →</text>
    </svg>
  );
}

export function AccessPanel({ value, onChange }: { value: AccessState; onChange: (patch: Partial<AccessState>) => void }) {
  const { stake, uptime, reputation, taskQuality, eligible, poolN } = value;

  const userBoost = useMemo(() => computeBoost({ stake, uptime, reputation, taskQuality, eligible }, DEFAULT_BOOST), [stake, uptime, reputation, taskQuality, eligible]);
  const competitorBoost = useMemo(() => computeBoost(COMPETITOR, DEFAULT_BOOST), []);
  const share = accessShare(userBoost, competitorBoost, poolN);
  const license = licenseForStake(stake);

  return (
    <div className="glass" style={{ padding: 28, display: 'grid', gap: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ color: 'var(--deep-sage)' }}><Icon name="custom" size={22} /></span>
          <div>
            <div className="eyebrow no-rule">Access &amp; Mining Boost</div>
            <div className="display" style={{ fontSize: 27, marginTop: 2 }}>Priority, not yield<span className="dot">.</span></div>
          </div>
        </div>
        <div className="tier-chip">
          <span className="label" style={{ color: 'var(--mint-ink)' }}>Current tier</span>
          <span className="display" style={{ fontSize: 18 }}>{license.name}</span>
        </div>
      </div>

      <div className="invest-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.05fr)', gap: 30 }}>
        <div style={{ display: 'grid', gap: 16 }}>
          <RangeField label="ARN staked" unit="ARN" value={stake} min={0} max={200000} step={1000} onChange={(v) => onChange({ stake: v })} display={(v) => Math.round(v).toLocaleString('en-IE')} />
          <RangeField label="Uptime" value={uptime} min={0.4} max={1} step={0.01} onChange={(v) => onChange({ uptime: v })} display={(v) => `${Math.round(v * 100)}%`} />
          <RangeField label="Reputation" value={reputation} min={0} max={1} step={0.01} onChange={(v) => onChange({ reputation: v })} display={(v) => `${Math.round(v * 100)}%`} />
          <RangeField label="Task quality" value={taskQuality} min={0} max={1} step={0.01} onChange={(v) => onChange({ taskQuality: v })} display={(v) => `${Math.round(v * 100)}%`} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div className="label">Eligibility</div>
              <div className="faint" style={{ fontSize: 11, marginTop: 3 }}>KYC &amp; jurisdiction — zero weight if ineligible</div>
            </div>
            <button className="toggle" data-on={eligible} onClick={() => onChange({ eligible: !eligible })} aria-pressed={eligible}>
              <motion.span layout className="toggle-knob" transition={{ type: 'spring', stiffness: 500, damping: 34 }} />
              <span className="toggle-txt">{eligible ? 'ELIGIBLE' : 'RESTRICTED'}</span>
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <div className="label">Your allocation priority</div>
              <CountUp className="stat-num" style={{ fontSize: 56, color: eligible ? 'var(--deep-sage)' : '#b06a5a', lineHeight: 0.9 }} value={share * 100} format={(v) => `${v.toFixed(2)}%`} />
              <div className="faint" style={{ fontSize: 11 }}>of a sample {poolN}-participant pool</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="label">Boost weight</div>
              <CountUp className="stat-num" style={{ fontSize: 26, color: 'var(--ink)' }} value={userBoost} format={(v) => v.toFixed(2)} />
            </div>
          </div>

          <div>
            <div className="label" style={{ marginBottom: 8 }}>Access weight vs stake · concave by design <Src k="boostConstants" /></div>
            <BoostCurve stake={stake} uptime={uptime} reputation={reputation} taskQuality={taskQuality} eligible={eligible} />
            <p className="faint" style={{ fontSize: 10.5, marginTop: 2 }}>Stake is logarithmic — large holders do not dominate allocation linearly.</p>
          </div>

          <RangeField label="Participants in pool" value={poolN} min={10} max={2000} step={10} onChange={(v) => onChange({ poolN: Math.round(v) })} display={(v) => Math.round(v).toLocaleString('en-IE')} />
        </div>
      </div>

      <div className="label" style={{ marginBottom: -6 }}>License tiers · tap to set <Src k="tiers" /></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 10 }}>
        {LICENSE_CLASSES.map((c) => {
          const on = c.key === license.key;
          return (
            <button
              key={c.key}
              className="license-chip"
              data-on={on}
              onClick={() => onChange({ stake: c.minStake })}
              aria-pressed={on}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                {on && <span className="live-dot" />}
                <span className="display" style={{ fontSize: 16 }}>{c.name}</span>
              </div>
              <span className="faint" style={{ fontSize: 10.5 }}>{c.grants}</span>
              <span className="label" style={{ fontSize: 9.5, color: 'var(--ink-faint)' }}>≥ {c.minStake.toLocaleString('en-IE')} ARN · tap to set</span>
            </button>
          );
        })}
      </div>

      <p className="faint" style={{ fontSize: 11, margin: 0, borderTop: '1px solid var(--line)', paddingTop: 14 }}>
        Mining Boost ranks <strong style={{ color: 'var(--ink-soft)' }}>access priority</strong> inside the Aerion dashboard. It does not
        distribute mining proceeds, fixed yield, or profit. Allocation share is illustrative against a sample pool.
      </p>
    </div>
  );
}
