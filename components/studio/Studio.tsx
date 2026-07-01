'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { DEFAULT_MINING_PARAMETERS, type ForwardAssumptions } from '@/packages/calc-engine';
import { presetByKey, type MiningPreset } from '@/lib/presets';
import {
  computeModule,
  computePortfolio,
  DEFAULT_ACCESS,
  DEFAULT_INVESTMENT,
  type AccessState,
  type InvestmentState,
  type ModuleConfig,
} from '@/lib/studio';
import { SummaryHero } from './SummaryHero';
import { ModuleCard } from './ModuleCard';
import { InvestmentPanel } from './InvestmentPanel';
import { AccessPanel } from './AccessPanel';
import { MarketStrip } from './MarketStrip';
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

interface Snapshot {
  m: ModuleConfig[];
  k: ForwardAssumptions;
  i: InvestmentState;
  a: AccessState;
}
function encode(s: Snapshot): string {
  try {
    return btoa(encodeURIComponent(JSON.stringify(s)));
  } catch {
    return '';
  }
}
function decodeSnapshot(str: string): Partial<Snapshot> | null {
  try {
    const o = JSON.parse(decodeURIComponent(atob(str)));
    if (o && typeof o === 'object') return o as Partial<Snapshot>;
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
  const [assumptions, setAssumptions] = useState<ForwardAssumptions>({
    horizonMonths: 48,
    hashpriceMonthlyChangePct: -0.01,
    discountAnnualPct: 0.12,
  });
  const [investment, setInvestment] = useState<InvestmentState>(DEFAULT_INVESTMENT);
  const [access, setAccess] = useState<AccessState>(DEFAULT_ACCESS);
  const hydrated = useRef(false);

  // hydrate from share link on mount
  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get('s');
    if (s) {
      const snap = decodeSnapshot(s);
      if (snap) {
        // Hydrate from the share link after mount — reading window during
        // render/init would cause an SSR hydration mismatch, so these must
        // run as post-mount effects.
        /* eslint-disable react-hooks/set-state-in-effect */
        if (Array.isArray(snap.m) && snap.m.length && snap.m.every((x) => x && typeof x.id === 'string')) {
          setModules(snap.m);
          seq.current = snap.m.length + 1;
        }
        if (snap.k && typeof snap.k.horizonMonths === 'number') setAssumptions(snap.k);
        if (snap.i && typeof snap.i.amount === 'number') setInvestment(snap.i);
        if (snap.a && typeof snap.a.stake === 'number') setAccess(snap.a);
        /* eslint-enable react-hooks/set-state-in-effect */
      }
    }
    hydrated.current = true;
  }, []);

  // reflect the full studio state into the URL
  useEffect(() => {
    if (!hydrated.current) return;
    const url = `${window.location.pathname}?s=${encode({ m: modules, k: assumptions, i: investment, a: access })}`;
    window.history.replaceState(null, '', url);
  }, [modules, assumptions, investment, access]);

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

  const results = useMemo(
    () => modules.map((c) => computeModule(c, params, assumptions)),
    [modules, params, assumptions],
  );
  const portfolio = useMemo(() => computePortfolio(results), [results]);

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
          <SummaryHero portfolio={portfolio} moduleCount={modules.length} horizonMonths={assumptions.horizonMonths} />
        </motion.div>

        <motion.section {...reveal} style={{ display: 'grid', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <span className="eyebrow">02 · Mining modules</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="pill" onClick={() => window.print()}>Export PDF</button>
              <button className="pill" onClick={copyLink}>
                <Icon name={copied ? 'arn' : 'copy'} size={13} />
                {copied ? 'Link copied' : 'Share'}
              </button>
            </div>
          </div>
          <MarketStrip
            a={assumptions}
            onChange={(patch) => setAssumptions((prev) => ({ ...prev, ...patch }))}
            asOf={params.asOf}
            hashprice={params.hashprice}
          />
          <motion.div layout style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 18, alignItems: 'start' }}>
            <AnimatePresence mode="popLayout">
              {modules.map((c, i) => (
                <ModuleCard
                  key={c.id}
                  index={i}
                  config={c}
                  result={results[i]}
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
          <InvestmentPanel value={investment} onChange={(patch) => setInvestment((prev) => ({ ...prev, ...patch }))} />
        </motion.section>

        <motion.section {...reveal} style={{ display: 'grid', gap: 16 }}>
          <span className="eyebrow">04 · Access &amp; node</span>
          <AccessPanel value={access} onChange={(patch) => setAccess((prev) => ({ ...prev, ...patch }))} />
        </motion.section>

        <LegalFooter asOf={params.asOf} source="aerion-tokenomics-simulation" />
      </main>
    </>
  );
}
