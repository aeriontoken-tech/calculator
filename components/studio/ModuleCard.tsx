'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { MiningParameters } from '@/packages/calc-engine';
import { computeModule, type ModuleConfig } from '@/lib/studio';
import { formatEur, formatEur2 } from '@/lib/format';
import { CountUp, Icon, RangeField } from './primitives';
import { IsoModule } from './IsoModule';

const ICON: Record<string, string> = { wind: 'wind', solar: 'solar', mixed: 'mixed', custom: 'custom' };

function MiniBand({
  conservative,
  base,
  optimistic,
}: {
  conservative: number;
  base: number;
  optimistic: number;
}) {
  const max = Math.max(Math.abs(conservative), Math.abs(base), Math.abs(optimistic), 1);
  const rows = [
    { k: 'Conservative', v: conservative, accent: false },
    { k: 'Base', v: base, accent: true },
    { k: 'Optimistic', v: optimistic, accent: false },
  ];
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {rows.map((r) => (
        <div key={r.k} style={{ display: 'grid', gridTemplateColumns: '78px 1fr 64px', alignItems: 'center', gap: 10 }}>
          <span className="label" style={{ fontSize: 9.5 }}>{r.k}</span>
          <div style={{ height: 5, borderRadius: 5, background: 'rgba(47,79,56,0.1)', overflow: 'hidden' }}>
            <motion.div
              animate={{ width: `${(Math.max(0, r.v) / max) * 100}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              style={{ height: '100%', borderRadius: 5, background: r.accent ? 'var(--mint)' : 'var(--sage)' }}
            />
          </div>
          <span className="stat-num" style={{ fontSize: 13, textAlign: 'right', color: r.v < 0 ? '#b06a5a' : 'var(--deep-sage)' }}>
            {formatEur2(r.v)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ModuleCard({
  config,
  params,
  onChange,
  onDuplicate,
  onRemove,
  index,
}: {
  config: ModuleConfig;
  params: MiningParameters;
  onChange: (patch: Partial<ModuleConfig>) => void;
  onDuplicate: () => void;
  onRemove: () => void;
  index: number;
}) {
  const [adv, setAdv] = useState(false);
  const r = computeModule(config, params);

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
            <div className="label" style={{ marginTop: 3 }}>{config.location}</div>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="stat-tile">
          <div className="label">Margin · day</div>
          <CountUp
            className="stat-num"
            style={{ fontSize: 30, color: r.marginDay < 0 ? '#b06a5a' : 'var(--ink)' }}
            value={r.marginDay}
            format={formatEur2}
          />
        </div>
        <div className="stat-tile">
          <div className="label">Payback</div>
          <CountUp
            className="stat-num"
            style={{ fontSize: 30, color: 'var(--ink)' }}
            value={r.paybackYears ?? 0}
            format={(v) => (r.paybackYears == null ? '—' : `${v.toFixed(2)} yr`)}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gap: 14, marginTop: 2 }}>
        <RangeField
          label="Energy price"
          unit="€/kWh"
          value={config.energyEurPerKwh}
          min={0.02}
          max={0.16}
          step={0.005}
          onChange={(v) => onChange({ energyEurPerKwh: v })}
          display={(v) => `€${v.toFixed(3)}`}
        />
        <RangeField
          label="Uptime"
          value={config.uptime}
          min={0.4}
          max={1}
          step={0.01}
          onChange={(v) => onChange({ uptime: v })}
          display={(v) => `${Math.round(v * 100)}%`}
        />
        <RangeField
          label="Miners"
          value={config.minerCount}
          min={1}
          max={200}
          step={1}
          onChange={(v) => onChange({ minerCount: Math.round(v) })}
          display={(v) => `${Math.round(v)}`}
        />
      </div>

      <button className="drawer-toggle" onClick={() => setAdv((a) => !a)} aria-expanded={adv}>
        <span className="label" style={{ color: 'var(--deep-sage)' }}>Advanced & scenario range</span>
        <motion.span animate={{ rotate: adv ? 180 : 0 }} style={{ display: 'inline-flex', color: 'var(--deep-sage)' }}>
          <Icon name="chevron" size={14} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {adv && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ display: 'grid', gap: 14, paddingTop: 4 }}>
              <RangeField
                label="Miner hashrate"
                unit="TH/s"
                value={config.hashrateTH}
                min={100}
                max={400}
                step={1}
                onChange={(v) => onChange({ hashrateTH: Math.round(v) })}
                display={(v) => `${Math.round(v)}`}
              />
              <RangeField
                label="Efficiency"
                unit="J/TH"
                value={config.efficiencyJPerTH}
                min={10}
                max={30}
                step={0.5}
                onChange={(v) => onChange({ efficiencyJPerTH: v })}
                display={(v) => v.toFixed(1)}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="stat-tile">
                  <div className="label">Fleet capex</div>
                  <span className="stat-num" style={{ fontSize: 18 }}>{formatEur(r.capex)}</span>
                </div>
                <div className="stat-tile">
                  <div className="label">Hashrate</div>
                  <span className="stat-num" style={{ fontSize: 18 }}>{r.hashratePH.toFixed(1)} PH/s</span>
                </div>
              </div>
              <div style={{ paddingTop: 2 }}>
                <div className="label" style={{ marginBottom: 9 }}>Scenario margin / day</div>
                <MiniBand
                  conservative={r.band.conservative.marginDay * r.minerCount}
                  base={r.band.base.marginDay * r.minerCount}
                  optimistic={r.band.optimistic.marginDay * r.minerCount}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
