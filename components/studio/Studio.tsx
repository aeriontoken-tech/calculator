'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { DEFAULT_MINING_PARAMETERS } from '@/packages/calc-engine';
import { presetByKey, type MiningPreset } from '@/lib/presets';
import { computeModule, computePortfolio, type ModuleConfig } from '@/lib/studio';
import { SummaryHero } from './SummaryHero';
import { ModuleCard } from './ModuleCard';
import { InvestmentPanel } from './InvestmentPanel';
import { AccessPanel } from './AccessPanel';
import { StudioHeader, AddModule, LegalFooter } from './chrome';
import { EnergyField } from './EnergyField';
import { Icon } from './primitives';

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

function encode(modules: ModuleConfig[]): string {
  try {
    return btoa(encodeURIComponent(JSON.stringify(modules)));
  } catch {
    return '';
  }
}
function decode(s: string): ModuleConfig[] | null {
  try {
    const arr = JSON.parse(decodeURIComponent(atob(s)));
    if (Array.isArray(arr) && arr.every((m) => m && typeof m.id === 'string')) return arr as ModuleConfig[];
  } catch {
    /* ignore */
  }
  return null;
}

const reveal = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.6, ease: [0.2, 0.7, 0.2, 1] as [number, number, number, number] },
};

export function Studio() {
  const params = DEFAULT_MINING_PARAMETERS;
  const seq = useRef(2);
  const [modules, setModules] = useState<ModuleConfig[]>(() => [
    configFromPreset(presetByKey('wietzen'), 'm1'),
    configFromPreset(presetByKey('hamburg'), 'm2'),
  ]);
  const [copied, setCopied] = useState(false);
  const hydrated = useRef(false);

  // hydrate from share link on mount
  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get('s');
    if (s) {
      const m = decode(s);
      if (m && m.length) {
        // Hydrate from the share link after mount — reading window during
        // render/init would cause an SSR hydration mismatch, so this must
        // run as a post-mount effect.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setModules(m);
        seq.current = m.length + 1;
      }
    }
    hydrated.current = true;
  }, []);

  // reflect module state into the URL
  useEffect(() => {
    if (!hydrated.current) return;
    const url = `${window.location.pathname}?s=${encode(modules)}`;
    window.history.replaceState(null, '', url);
  }, [modules]);

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
      return [...m.slice(0, i + 1), { ...src, id: `m${seq.current}` }, ...m.slice(i + 1)];
    });
  const remove = (id: string) => setModules((m) => (m.length > 1 ? m.filter((c) => c.id !== id) : m));

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  const portfolio = useMemo(
    () => computePortfolio(modules.map((c) => computeModule(c, params))),
    [modules, params],
  );

  return (
    <>
      <EnergyField />
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
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}>
          <SummaryHero portfolio={portfolio} moduleCount={modules.length} />
        </motion.div>

        <motion.section {...reveal} style={{ display: 'grid', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <span className="eyebrow">02 · Mining modules</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span className="label studio-nav-extra">{params.defaults.hashrateTH} TH/s · hashprice €{params.hashprice}/PH·day</span>
              <button className="pill" onClick={copyLink}>
                <Icon name={copied ? 'arn' : 'copy'} size={13} />
                {copied ? 'Link copied' : 'Share'}
              </button>
            </div>
          </div>
          <motion.div layout style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 18, alignItems: 'start' }}>
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
        </motion.section>

        <motion.section {...reveal} style={{ display: 'grid', gap: 16 }}>
          <span className="eyebrow">03 · ARN investment</span>
          <InvestmentPanel />
        </motion.section>

        <motion.section {...reveal} style={{ display: 'grid', gap: 16 }}>
          <span className="eyebrow">04 · Access &amp; node</span>
          <AccessPanel />
        </motion.section>

        <LegalFooter asOf={params.asOf} source="aerion-tokenomics-simulation" />
      </main>
    </>
  );
}
