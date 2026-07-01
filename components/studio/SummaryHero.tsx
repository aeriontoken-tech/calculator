'use client';

import { motion } from 'motion/react';
import type { PortfolioResult } from '@/lib/studio';
import { formatEur } from '@/lib/format';
import { CountUp } from './primitives';

function fmtMonths(m: number | null, horizon: number): string {
  if (m == null) return `> ${(horizon / 12).toFixed(0)} yr`;
  return m >= 18 ? `${(m / 12).toFixed(1)} yr` : `${m} mo`;
}

function Stat({ label, value, format }: { label: string; value: number; format: (n: number) => string }) {
  return (
    <div className="stat-tile">
      <div className="label">{label}</div>
      <CountUp className="stat-num" style={{ fontSize: 24, color: 'var(--ink)' }} value={value} format={format} />
    </div>
  );
}

export function SummaryHero({
  portfolio,
  moduleCount,
  horizonMonths,
}: {
  portfolio: PortfolioResult;
  moduleCount: number;
  horizonMonths: number;
}) {
  const positive = portfolio.marginDay >= 0;
  return (
    <motion.div layout className="glass glass-solid" style={{ padding: '32px 34px', overflow: 'hidden', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24 }}>
        <div style={{ maxWidth: 430 }}>
          <div className="eyebrow">Your simulation · {moduleCount} module{moduleCount === 1 ? '' : 's'}</div>
          <h1 className="display" style={{ fontSize: 'clamp(36px, 4.6vw, 58px)', marginTop: 14 }}>
            What the energy
            <br />
            actually earns<span className="dot">.</span>
          </h1>
          <p className="muted" style={{ maxWidth: 380, marginTop: 14, fontSize: 13.5 }}>
            Combined cash margin today, plus the discounted net present value over your {horizonMonths}-month horizon under difficulty drift.
          </p>
        </div>

        <div style={{ display: 'grid', gap: 16, justifyItems: 'end' }}>
          <div style={{ textAlign: 'right' }}>
            <div className="label" style={{ justifyContent: 'flex-end', display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="live-dot" /> Combined margin · day
            </div>
            <CountUp
              className="stat-num"
              style={{ fontSize: 'clamp(48px, 7vw, 86px)', color: positive ? 'var(--deep-sage)' : '#b06a5a', display: 'block', lineHeight: 0.9, marginTop: 4 }}
              value={portfolio.marginDay}
              format={formatEur}
            />
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="label" style={{ justifyContent: 'flex-end' }}>Portfolio NPV · {horizonMonths}mo</div>
            <CountUp
              className="stat-num"
              style={{ fontSize: 'clamp(26px, 3.4vw, 40px)', color: portfolio.npv < 0 ? '#b06a5a' : 'var(--ink)' }}
              value={portfolio.npv}
              format={formatEur}
            />
          </div>
        </div>
      </div>

      <hr className="hr" style={{ margin: '24px 0 20px' }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 22 }}>
        <div className="stat-tile">
          <div className="label">Forward payback</div>
          <span className="stat-num" style={{ fontSize: 24, color: 'var(--ink)' }}>{fmtMonths(portfolio.forwardPaybackMonths, horizonMonths)}</span>
        </div>
        <Stat label="Fleet capex" value={portfolio.capex} format={formatEur} />
        <Stat label="Hashrate · PH/s" value={portfolio.hashratePH} format={(v) => v.toFixed(1)} />
        <Stat label="Load · kW" value={portfolio.powerKW} format={(v) => Math.round(v).toLocaleString('en-IE')} />
        <Stat label="Miners" value={portfolio.minerCount} format={(v) => Math.round(v).toLocaleString('en-IE')} />
      </div>
    </motion.div>
  );
}
