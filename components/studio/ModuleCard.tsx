'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { ModuleConfig, ModuleResult } from '@/lib/studio';
import { formatEur } from '@/lib/format';
import { CountUp, Icon, RangeField } from './primitives';
import { IsoModule } from './IsoModule';
import { CashflowCurve } from './CashflowCurve';
import { Src } from './SourceTag';

const ICON: Record<string, string> = { wind: 'wind', solar: 'solar', mixed: 'mixed', custom: 'custom' };

function fmtMonths(m: number | null, horizon: number): string {
  if (m == null) return `> ${(horizon / 12).toFixed(0)} yr`;
  return m >= 18 ? `${(m / 12).toFixed(1)} yr` : `${m} mo`;
}

export function ModuleCard({
  config,
  result,
  onChange,
  onDuplicate,
  onRemove,
  index,
}: {
  config: ModuleConfig;
  result: ModuleResult;
  onChange: (patch: Partial<ModuleConfig>) => void;
  onDuplicate: () => void;
  onRemove: () => void;
  index: number;
}) {
  const [adv, setAdv] = useState(false);
  const r = result;
  const horizon = r.cashflow.length;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 260, damping: 30, delay: index * 0.04 }}
      className="glass"
      style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 11 }}>
          <span style={{ color: 'var(--deep-sage)', marginTop: 2 }}>
            <Icon name={ICON[config.energyType] ?? 'custom'} size={18} />
          </span>
          <div>
            <div className="display" style={{ fontSize: 23 }}>{config.name}</div>
            <div className="label" style={{ marginTop: 3 }}>
              {config.location} <Src k="siteParams" />
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="icon-btn" aria-label="Duplicate module" onClick={onDuplicate}>
            <Icon name="copy" size={14} />
          </button>
          <button className="icon-btn" aria-label="Remove module" onClick={onRemove}>
            <Icon name="close" size={14} />
          </button>
        </div>
      </div>

      <div style={{ height: 196, margin: '-2px 0 -6px' }}>
        <IsoModule energyType={config.energyType} uptime={config.uptime} minerCount={config.minerCount} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <div className="stat-tile">
          <div className="label">Margin/day</div>
          <CountUp className="stat-num" style={{ fontSize: 24, color: r.marginDay < 0 ? '#b06a5a' : 'var(--ink)' }} value={r.marginDay} format={(v) => formatEur(v)} />
        </div>
        <div className="stat-tile">
          <div className="label">Payback</div>
          <span className="stat-num" style={{ fontSize: 24, color: 'var(--ink)' }}>{fmtMonths(r.forwardPaybackMonths, horizon)}</span>
        </div>
        <div className="stat-tile">
          <div className="label">NPV · {horizon}mo</div>
          <CountUp className="stat-num" style={{ fontSize: 24, color: r.npv < 0 ? '#b06a5a' : 'var(--deep-sage)' }} value={r.npv} format={(v) => formatEur(v)} />
        </div>
      </div>

      <div>
        <div className="label" style={{ marginBottom: 6 }}>Cumulative cash flow · under difficulty drift</div>
        <CashflowCurve cashflow={r.cashflow} height={140} />
      </div>

      <div style={{ display: 'grid', gap: 14, marginTop: 2 }}>
        <RangeField label="Energy price" unit="€/kWh" value={config.energyEurPerKwh} min={0.02} max={0.16} step={0.005} onChange={(v) => onChange({ energyEurPerKwh: v })} display={(v) => `€${v.toFixed(3)}`} />
        <RangeField label="Uptime" value={config.uptime} min={0.4} max={1} step={0.01} onChange={(v) => onChange({ uptime: v })} display={(v) => `${Math.round(v * 100)}%`} />
        <RangeField label="Miners" value={config.minerCount} min={1} max={200} step={1} onChange={(v) => onChange({ minerCount: Math.round(v) })} display={(v) => `${Math.round(v)}`} />
      </div>

      <button className="drawer-toggle" onClick={() => setAdv((a) => !a)} aria-expanded={adv}>
        <span className="label" style={{ color: 'var(--deep-sage)' }}>Advanced &amp; Monte-Carlo range</span>
        <motion.span animate={{ rotate: adv ? 180 : 0 }} style={{ display: 'inline-flex', color: 'var(--deep-sage)' }}>
          <Icon name="chevron" size={14} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {adv && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }} style={{ overflow: 'hidden' }}>
            <div style={{ display: 'grid', gap: 14, paddingTop: 4 }}>
              <RangeField label="Miner hashrate" unit="TH/s" value={config.hashrateTH} min={100} max={400} step={1} onChange={(v) => onChange({ hashrateTH: Math.round(v) })} display={(v) => `${Math.round(v)}`} />
              <RangeField label="Efficiency" unit="J/TH" value={config.efficiencyJPerTH} min={10} max={30} step={0.5} onChange={(v) => onChange({ efficiencyJPerTH: v })} display={(v) => v.toFixed(1)} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="stat-tile"><div className="label">Fleet capex <Src k="minerCapex" /></div><span className="stat-num" style={{ fontSize: 18 }}>{formatEur(r.capex)}</span></div>
                <div className="stat-tile"><div className="label">Hashrate</div><span className="stat-num" style={{ fontSize: 18 }}>{r.hashratePH.toFixed(1)} PH/s</span></div>
              </div>
              <div style={{ paddingTop: 2 }}>
                <div className="label" style={{ marginBottom: 9 }}>Monte-Carlo range · 240 paths</div>
                <div className="mc-grid">
                  <div><span className="label">Payback</span><div className="mc-band"><span>{fmtMonths(r.mc.paybackP10, horizon)}</span><span className="dot">●</span><span>{fmtMonths(r.mc.paybackP50, horizon)}</span><span>{fmtMonths(r.mc.paybackP90, horizon)}</span></div></div>
                  <div><span className="label">NPV · {horizon}mo</span><div className="mc-band"><span>{formatEur(r.mc.npvP10)}</span><span className="dot">●</span><span>{formatEur(r.mc.npvP50)}</span><span>{formatEur(r.mc.npvP90)}</span></div></div>
                </div>
                <p className="faint" style={{ fontSize: 10, marginTop: 6 }}>P10 · P50 · P90 across hashprice, difficulty drift, energy &amp; uptime.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
