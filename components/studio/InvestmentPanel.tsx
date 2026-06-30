'use client';

import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  SALE_ROUNDS,
  SUPPLY_FACTS,
  computeAllocation,
  computeVesting,
  type SaleRound,
} from '@/packages/calc-engine';
import { formatArn, formatEur } from '@/lib/format';
import { CountUp, Icon, RangeField, Segmented } from './primitives';

function VestingCurve({ round, arn }: { round: SaleRound; arn: number }) {
  const months = 36;
  const pts = computeVesting(round, arn, months);
  const W = 420;
  const Hh = 120;
  const pad = 10;
  const x = (m: number) => pad + (m / months) * (W - 2 * pad);
  const y = (f: number) => Hh - pad - f * (Hh - 2 * pad);
  const line = pts.map((p) => `${x(p.month).toFixed(1)},${y(p.unlockedFraction).toFixed(1)}`).join(' ');
  const area = `${pad},${Hh - pad} ${line} ${W - pad},${Hh - pad}`;
  const cliffX = x(round.cliffMonths);
  return (
    <svg viewBox={`0 0 ${W} ${Hh + 16}`} width="100%" height="auto" role="img" aria-label="ARN unlock schedule over 36 months">
      <defs>
        <linearGradient id="vest-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgba(139,227,160,0.42)" />
          <stop offset="1" stopColor="rgba(139,227,160,0)" />
        </linearGradient>
      </defs>
      <line x1={pad} y1={Hh - pad} x2={W - pad} y2={Hh - pad} stroke="var(--line)" />
      <line x1={cliffX} y1={pad} x2={cliffX} y2={Hh - pad} stroke="var(--line-strong)" strokeDasharray="3 3" />
      <motion.polygon points={area} fill="url(#vest-fill)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
      <motion.polyline
        points={line}
        fill="none"
        stroke="var(--mint-ink)"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      />
      <text x={cliffX} y={Hh + 12} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--ink-faint)">
        cliff · {round.cliffMonths}mo
      </text>
      <text x={pad} y={Hh + 12} fontFamily="var(--font-mono)" fontSize="9" fill="var(--ink-faint)">0</text>
      <text x={W - pad} y={Hh + 12} textAnchor="end" fontFamily="var(--font-mono)" fontSize="9" fill="var(--ink-faint)">
        36mo
      </text>
    </svg>
  );
}

export function InvestmentPanel() {
  const [roundKey, setRoundKey] = useState<SaleRound['key']>('public');
  const [amount, setAmount] = useState(5000);
  const [dashboard, setDashboard] = useState(true);
  const [hypo, setHypo] = useState<string>('');

  const round = SALE_ROUNDS.find((r) => r.key === roundKey) ?? SALE_ROUNDS[2];
  const hypoNum = hypo.trim() === '' ? null : Number(hypo);
  const result = useMemo(
    () =>
      computeAllocation({
        amountEur: amount,
        round,
        dashboardBonusPct: dashboard ? SUPPLY_FACTS.defaultDashboardBonusPct : 0,
        hypotheticalPriceEur: hypoNum != null && Number.isFinite(hypoNum) ? hypoNum : null,
      }),
    [amount, round, dashboard, hypoNum],
  );

  return (
    <div className="glass" style={{ padding: 26, display: 'grid', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 11, alignItems: 'center' }}>
          <span style={{ color: 'var(--deep-sage)' }}><Icon name="arn" size={20} /></span>
          <div>
            <div className="eyebrow no-rule">ARN Position</div>
            <div className="display" style={{ fontSize: 25, marginTop: 2 }}>Acquire &amp; hold.</div>
          </div>
        </div>
        <Segmented
          value={roundKey}
          onChange={setRoundKey}
          options={SALE_ROUNDS.map((r) => ({ value: r.key, label: `${r.label} · €${r.priceEur}` }))}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 1fr)', gap: 28 }} className="invest-grid">
        <div style={{ display: 'grid', gap: 18 }}>
          <RangeField
            label="Investment"
            unit="EUR"
            value={amount}
            min={100}
            max={100000}
            step={100}
            onChange={setAmount}
            display={(v) => formatEur(v)}
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div className="label">Acquire via</div>
              <div className="faint" style={{ fontSize: 11, marginTop: 3 }}>
                Dashboard adds {Math.round(SUPPLY_FACTS.defaultDashboardBonusPct * 100)}% bonus ARN
              </div>
            </div>
            <button
              className="toggle"
              data-on={dashboard}
              onClick={() => setDashboard((d) => !d)}
              aria-pressed={dashboard}
              aria-label="Acquire via dashboard"
            >
              <motion.span layout className="toggle-knob" transition={{ type: 'spring', stiffness: 500, damping: 34 }} />
              <span className="toggle-txt">{dashboard ? 'DASHBOARD' : 'EXCHANGE'}</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, paddingTop: 4 }}>
            <div className="stat-tile">
              <div className="label">ARN received</div>
              <CountUp className="stat-num" style={{ fontSize: 30, color: 'var(--ink)' }} value={result.arnReceived} format={(v) => formatArn(v)} />
              {result.bonusArn > 0 && (
                <span className="faint" style={{ fontSize: 11 }}>+{Math.round(result.bonusArn).toLocaleString('en-IE')} bonus</span>
              )}
            </div>
            <div className="stat-tile">
              <div className="label">Cost basis</div>
              <CountUp className="stat-num" style={{ fontSize: 30, color: 'var(--ink)' }} value={result.costBasisEur} format={(v) => `€${v.toFixed(3)}`} />
            </div>
          </div>

          <div className="hypo">
            <span className="label">If ARN were</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="faint">€</span>
              <input
                className="num-chip"
                style={{ width: 70 }}
                inputMode="decimal"
                placeholder="0.40"
                value={hypo}
                onChange={(e) => setHypo(e.target.value)}
                aria-label="Hypothetical ARN price"
              />
            </div>
            <span className="faint" style={{ fontSize: 11 }}>→</span>
            <span className="stat-num" style={{ fontSize: 18, color: 'var(--deep-sage)' }}>
              {result.hypotheticalValueEur != null ? formatEur(result.hypotheticalValueEur) : '—'}
            </span>
            <span className="faint" style={{ fontSize: 10 }}>hypothetical · not a forecast</span>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
          <div className="label">Unlock schedule · {round.label}</div>
          <VestingCurve round={round} arn={result.arnReceived} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 2 }}>
            <div className="scarcity">
              <span className="stat-num" style={{ fontSize: 20, color: 'var(--deep-sage)' }}>~97%</span>
              <span className="faint" style={{ fontSize: 10.5 }}>of the POMP reserve stays locked (P50)</span>
            </div>
            <div className="scarcity">
              <span className="stat-num" style={{ fontSize: 20, color: 'var(--deep-sage)' }}>{SUPPLY_FACTS.absorptionCoverageM48P50.toFixed(1)}×</span>
              <span className="faint" style={{ fontSize: 10.5 }}>demand vs liquid supply, month 48 (P50)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
