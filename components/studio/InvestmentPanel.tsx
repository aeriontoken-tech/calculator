'use client';

import { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  SALE_ROUNDS,
  SUPPLY_FACTS,
  computeAllocation,
  computeVesting,
  type SaleRound,
} from '@/packages/calc-engine';
import type { InvestmentState } from '@/lib/studio';
import { formatArn, formatEur } from '@/lib/format';
import { CountUp, Icon, RangeField, Segmented } from './primitives';
import { Src } from './SourceTag';

function VestingCurve({ round, arn, horizon }: { round: SaleRound; arn: number; horizon: number }) {
  const months = 36;
  const pts = computeVesting(round, arn, months);
  const W = 460;
  const Hh = 150;
  const pad = 12;
  const x = (m: number) => pad + (m / months) * (W - 2 * pad);
  const y = (f: number) => Hh - pad - f * (Hh - 2 * pad);
  const full = pts.map((p) => `${x(p.month).toFixed(1)},${y(p.unlockedFraction).toFixed(1)}`).join(' ');
  const upTo = pts.filter((p) => p.month <= horizon);
  const litLine = upTo.map((p) => `${x(p.month).toFixed(1)},${y(p.unlockedFraction).toFixed(1)}`).join(' ');
  const litArea = `${pad},${Hh - pad} ${litLine} ${x(horizon).toFixed(1)},${Hh - pad}`;
  const at = pts[Math.min(horizon, months)];
  const cliffX = x(round.cliffMonths);
  const hx = x(horizon);
  const hy = y(at.unlockedFraction);

  return (
    <svg viewBox={`0 0 ${W} ${Hh + 20}`} width="100%" height="auto" role="img" aria-label="ARN unlock schedule">
      <defs>
        <linearGradient id="vest-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgba(139,227,160,0.5)" />
          <stop offset="1" stopColor="rgba(139,227,160,0)" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((g) => (
        <line key={g} x1={pad} y1={y(g)} x2={W - pad} y2={y(g)} stroke="var(--line)" strokeWidth="0.6" />
      ))}
      <line x1={pad} y1={Hh - pad} x2={W - pad} y2={Hh - pad} stroke="var(--line-strong)" />
      <line x1={cliffX} y1={pad} x2={cliffX} y2={Hh - pad} stroke="var(--line-strong)" strokeDasharray="3 3" />
      <motion.polygon points={litArea} fill="url(#vest-fill)" initial={false} />
      <polyline points={full} fill="none" stroke="var(--line-strong)" strokeWidth="1.4" strokeDasharray="3 4" />
      <motion.polyline
        points={litLine}
        fill="none"
        stroke="var(--mint-ink)"
        strokeWidth="2.4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      />
      <motion.line x1={hx} y1={pad} x2={hx} y2={Hh - pad} stroke="var(--mint-ink)" strokeWidth="1" animate={{ x1: hx, x2: hx }} />
      <motion.circle cx={hx} cy={hy} r="4.5" fill="var(--mint-ink)" stroke="var(--paper-3)" strokeWidth="2" animate={{ cx: hx, cy: hy }} />
      <text x={cliffX} y={Hh + 14} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--ink-faint)">cliff · {round.cliffMonths}mo</text>
      <text x={pad} y={Hh + 14} fontFamily="var(--font-mono)" fontSize="9" fill="var(--ink-faint)">0</text>
      <text x={W - pad} y={Hh + 14} textAnchor="end" fontFamily="var(--font-mono)" fontSize="9" fill="var(--ink-faint)">36mo</text>
    </svg>
  );
}

const SCENARIO_PRICES = [0.2, 0.4, 0.8];

export function InvestmentPanel({ value, onChange }: { value: InvestmentState; onChange: (patch: Partial<InvestmentState>) => void }) {
  const round = SALE_ROUNDS.find((r) => r.key === value.roundKey) ?? SALE_ROUNDS[2];
  const activePrice = value.customPrice.trim() !== '' && Number.isFinite(Number(value.customPrice)) ? Number(value.customPrice) : value.scenario;

  const result = useMemo(
    () =>
      computeAllocation({
        amountEur: value.amount,
        round,
        dashboardBonusPct: value.dashboard ? SUPPLY_FACTS.defaultDashboardBonusPct : 0,
        hypotheticalPriceEur: activePrice != null && Number.isFinite(activePrice) ? activePrice : null,
      }),
    [value.amount, round, value.dashboard, activePrice],
  );
  const vest = useMemo(() => computeVesting(round, result.arnReceived, 36), [round, result.arnReceived]);
  const atHorizon = vest[Math.min(value.horizon, 36)];
  const supplyPct = (result.arnReceived / SUPPLY_FACTS.maxSupply) * 100;
  const multiple = activePrice != null && value.amount > 0 ? (result.arnReceived * activePrice) / value.amount : null;

  return (
    <div className="glass" style={{ padding: 28, display: 'grid', gap: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ color: 'var(--deep-sage)' }}><Icon name="arn" size={22} /></span>
          <div>
            <div className="eyebrow no-rule">ARN Position</div>
            <div className="display" style={{ fontSize: 27, marginTop: 2 }}>Acquire &amp; hold<span className="dot">.</span></div>
          </div>
        </div>
        <div style={{ display: 'grid', gap: 6, justifyItems: 'end' }}>
          <Segmented value={value.roundKey} onChange={(v) => onChange({ roundKey: v })} options={SALE_ROUNDS.map((r) => ({ value: r.key, label: `${r.label} · €${r.priceEur}` }))} />
          <span className="faint" style={{ fontSize: 10.5 }}>
            {round.cliffMonths}mo cliff · {Math.round(round.cliffUnlock * 100)}% then linear over {round.linearMonths}mo <Src k="saleRounds" />
          </span>
        </div>
      </div>

      <div className="invest-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.05fr)', gap: 30 }}>
        <div style={{ display: 'grid', gap: 18 }}>
          <RangeField label="Investment" unit="EUR" value={value.amount} min={100} max={100000} step={100} onChange={(v) => onChange({ amount: v })} display={(v) => formatEur(v)} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div className="label">Acquire via</div>
              <div className="faint" style={{ fontSize: 11, marginTop: 3 }}>Dashboard adds {Math.round(SUPPLY_FACTS.defaultDashboardBonusPct * 100)}% bonus ARN</div>
            </div>
            <button className="toggle" data-on={value.dashboard} onClick={() => onChange({ dashboard: !value.dashboard })} aria-pressed={value.dashboard} aria-label="Acquire via dashboard">
              <motion.span layout className="toggle-knob" transition={{ type: 'spring', stiffness: 500, damping: 34 }} />
              <span className="toggle-txt">{value.dashboard ? 'DASHBOARD' : 'EXCHANGE'}</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, padding: '6px 0' }}>
            <div className="stat-tile">
              <div className="label">ARN received</div>
              <CountUp className="stat-num" style={{ fontSize: 32, color: 'var(--ink)' }} value={result.arnReceived} format={formatArn} />
              <span className="faint" style={{ fontSize: 11 }}>
                {result.bonusArn > 0 ? `+${Math.round(result.bonusArn).toLocaleString('en-IE')} bonus · ` : ''}
                {supplyPct.toFixed(4)}% of supply
              </span>
            </div>
            <div className="stat-tile">
              <div className="label">Cost basis</div>
              <CountUp className="stat-num" style={{ fontSize: 32, color: 'var(--ink)' }} value={result.costBasisEur} format={(v) => `€${v.toFixed(3)}`} />
              <span className="faint" style={{ fontSize: 11 }}>effective per ARN</span>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <span className="label">Illustrative value · if ARN were <Src k="arnPriceScenario" /></span>
              <span className="faint" style={{ fontSize: 10 }}>you set the price · not a forecast</span>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {SCENARIO_PRICES.map((pr) => (
                <button key={pr} className="chip" data-on={activePrice === pr && value.customPrice.trim() === ''} onClick={() => onChange({ scenario: pr, customPrice: '' })}>
                  €{pr.toFixed(2)}
                </button>
              ))}
              <span className="faint">·</span>
              <input className="num-chip" style={{ width: 72 }} inputMode="decimal" placeholder="custom" value={value.customPrice} onChange={(e) => onChange({ customPrice: e.target.value })} aria-label="Custom ARN price" />
            </div>
            <div className="value-row">
              <div>
                <div className="label">Position value</div>
                <CountUp className="stat-num" style={{ fontSize: 28, color: 'var(--deep-sage)' }} value={result.hypotheticalValueEur ?? 0} format={(v) => (result.hypotheticalValueEur == null ? '—' : formatEur(v))} />
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="label">vs cost</div>
                <CountUp className="stat-num" style={{ fontSize: 28, color: multiple != null && multiple >= 1 ? 'var(--mint-ink)' : 'var(--ink)' }} value={multiple ?? 0} format={(v) => (multiple == null ? '—' : `${v.toFixed(1)}×`)} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="label">Unlock schedule · {round.label}</span>
            <Segmented value={String(value.horizon)} onChange={(v) => onChange({ horizon: Number(v) })} options={[{ value: '12', label: '12mo' }, { value: '24', label: '24mo' }, { value: '36', label: '36mo' }]} />
          </div>
          <VestingCurve round={round} arn={result.arnReceived} horizon={value.horizon} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="stat-tile" style={{ padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 'var(--r-md)', background: 'var(--paper-3)' }}>
              <div className="label">Unlocked at {value.horizon}mo</div>
              <CountUp className="stat-num" style={{ fontSize: 20, color: 'var(--deep-sage)' }} value={atHorizon.unlockedArn} format={(v) => `${Math.round(v).toLocaleString('en-IE')}`} />
              <span className="faint" style={{ fontSize: 10.5 }}>{Math.round(atHorizon.unlockedFraction * 100)}% of your ARN</span>
            </div>
            <div className="stat-tile" style={{ padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 'var(--r-md)', background: 'var(--paper-3)' }}>
              <div className="label">Still locked</div>
              <CountUp className="stat-num" style={{ fontSize: 20, color: 'var(--ink)' }} value={result.arnReceived - atHorizon.unlockedArn} format={(v) => `${Math.round(v).toLocaleString('en-IE')}`} />
              <span className="faint" style={{ fontSize: 10.5 }}>vesting continues</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="scarcity"><span className="stat-num" style={{ fontSize: 19, color: 'var(--deep-sage)' }}>~97%</span><span className="faint" style={{ fontSize: 10 }}>POMP reserve stays locked (P50)</span></div>
            <div className="scarcity"><span className="stat-num" style={{ fontSize: 19, color: 'var(--deep-sage)' }}>{SUPPLY_FACTS.absorptionCoverageM48P50.toFixed(1)}×</span><span className="faint" style={{ fontSize: 10 }}>demand vs liquid supply, m48 (P50)</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
