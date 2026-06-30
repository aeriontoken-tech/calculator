'use client';

import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { DEFAULT_MINING_PARAMETERS } from '@/packages/calc-engine';
import { presetByKey, type MiningPreset } from '@/lib/presets';
import { computeModule, computePortfolio, type ModuleConfig } from '@/lib/studio';
import { SummaryHero } from './SummaryHero';
import { ModuleCard } from './ModuleCard';
import { InvestmentPanel } from './InvestmentPanel';
import { StudioHeader, AddModule, LegalFooter } from './chrome';

function configFromPreset(p: MiningPreset, id: string): ModuleConfig {
  return {
    id,
    presetKey: p.key,
    name: p.name,
    location: p.location,
    energyType: p.energyType,
    energyEurPerKwh: p.energyEurPerKwh,
    uptime: p.uptime,
    minerCount: p.minerCount,
    hashrateTH: p.hashrateTH,
    efficiencyJPerTH: p.efficiencyJPerTH,
  };
}

export function Studio() {
  const params = DEFAULT_MINING_PARAMETERS;
  const seq = useRef(2);
  const [modules, setModules] = useState<ModuleConfig[]>(() => [
    configFromPreset(presetByKey('wietzen'), 'm1'),
    configFromPreset(presetByKey('hamburg'), 'm2'),
  ]);

  const addPreset = (key: string) => {
    seq.current += 1;
    setModules((m) => [...m, configFromPreset(presetByKey(key), `m${seq.current}`)]);
  };
  const updateModule = (id: string, patch: Partial<ModuleConfig>) =>
    setModules((m) => m.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const duplicate = (id: string) =>
    setModules((m) => {
      const src = m.find((c) => c.id === id);
      if (!src) return m;
      seq.current += 1;
      const i = m.findIndex((c) => c.id === id);
      const copy = { ...src, id: `m${seq.current}` };
      return [...m.slice(0, i + 1), copy, ...m.slice(i + 1)];
    });
  const remove = (id: string) => setModules((m) => m.filter((c) => c.id !== id));

  const portfolio = useMemo(
    () => computePortfolio(modules.map((c) => computeModule(c, params))),
    [modules, params],
  );

  return (
    <>
      <StudioHeader />
      <main
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 1180,
          margin: '0 auto',
          padding: '34px 22px 0',
          display: 'grid',
          gap: 30,
        }}
      >
        <SummaryHero portfolio={portfolio} moduleCount={modules.length} />

        <section style={{ display: 'grid', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span className="eyebrow">02 · Mining modules</span>
            <span className="label">{params.defaults.hashrateTH} TH/s · hashprice €{params.hashprice}/PH·day</span>
          </div>
          <motion.div
            layout
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 18, alignItems: 'start' }}
          >
            <AnimatePresence mode="popLayout">
              {modules.map((c, i) => (
                <ModuleCard
                  key={c.id}
                  index={i}
                  config={c}
                  params={params}
                  onChange={(patch) => updateModule(c.id, patch)}
                  onDuplicate={() => duplicate(c.id)}
                  onRemove={() => remove(c.id)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
          <AddModule onAdd={addPreset} />
        </section>

        <section style={{ display: 'grid', gap: 16 }}>
          <span className="eyebrow">03 · ARN investment</span>
          <InvestmentPanel />
        </section>

        <LegalFooter asOf={params.asOf} source="aerion-tokenomics-simulation" />
      </main>
    </>
  );
}
