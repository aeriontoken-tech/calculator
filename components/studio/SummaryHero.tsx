'use client';

import { motion } from 'motion/react';
import type { PortfolioResult } from '@/lib/studio';
import { formatEur, formatYears } from '@/lib/format';
import { CountUp } from './primitives';

function Stat({ label, value, format, big }: { label: string; value: number; format: (n: number) => string; big?: boolean }) {
  return (
    <div className="stat-tile">
      <div className="label">{label}</div>
      <CountUp className="stat-num" style={{ fontSize: big ? 34 : 24, color: 'var(--ink)' }} value={value} format={format} />
    </div>
  );
}

export function SummaryHero({ portfolio, moduleCount }: { portfolio: PortfolioResult; moduleCount: number }) {
  const positive = portfolio.marginDay >= 0;
  return (
    <motion.div
      layout
      className="glass glass-solid"
      style={{ padding: '32px 34px', overflow: 'hidden', position: 'relative' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24 }}>
        <div style={{ maxWidth: 440 }}>
          <div className="eyebrow">Your simulation · {moduleCount} module{moduleCount === 1 ? '' : 's'}</div>
          <h1 className="display" style={{ fontSize: 'clamp(38px, 5vw, 60px)', marginTop: 14 }}>
            What the energy
            <br />
            actually earns<span className="dot">.</span>
          </h1>
          <p className="muted" style={{ maxWidth: 380, marginTop: 14, fontSize: 13.5 }}>
            Combined cash margin across every mining module, net of energy and operating cost. Tune anything below and watch it resolve.
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div className="label" style={{ justifyContent: 'flex-end', display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="live-dot" /> Combined margin · day
          </div>
          <CountUp
            className="stat-num"
            style={{ fontSize: 'clamp(56px, 9vw, 104px)', color: positive ? 'var(--deep-sage)' : '#b06a5a', display: 'block', lineHeight: 0.9, marginTop: 6 }}
            value={portfolio.marginDay}
            format={formatEur}
          />
          <div className="muted" style={{ fontSize: 13, marginTop: 6 }}>
            <CountUp value={portfolio.marginYear} format={(v) => formatEur(v)} /> / year
          </div>
        </div>
      </div>

      <hr className="hr" style={{ margin: '26px 0 22px' }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 22 }}>
        <Stat label="Blended payback" value={portfolio.paybackYears ?? 0} format={(v) => (portfolio.paybackYears == null ? '—' : formatYears(v))} />
        <Stat label="Fleet capex" value={portfolio.capex} format={formatEur} />
        <Stat label="Hashrate · PH/s" value={portfolio.hashratePH} format={(v) => v.toFixed(1)} />
        <Stat label="Load · kW" value={portfolio.powerKW} format={(v) => Math.round(v).toLocaleString('en-IE')} />
        <Stat label="Miners" value={portfolio.minerCount} format={(v) => Math.round(v).toLocaleString('en-IE')} />
      </div>
    </motion.div>
  );
}
