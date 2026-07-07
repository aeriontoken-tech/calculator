'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { DEFAULT_MINING_PARAMETERS } from '@/packages/calc-engine';
import {
  DEFAULT_ACCESS,
  DEFAULT_INVESTMENT,
  type AccessState,
  type InvestmentState,
} from '@/lib/studio';
import { InvestmentPanel } from './InvestmentPanel';
import { AccessPanel } from './AccessPanel';
import { StudioHeader, LegalFooter } from './chrome';
import { EnergyField } from './EnergyField';
import { Icon } from './primitives';
import { getStudioMarket } from '@/lib/market';

interface Snapshot {
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
  const market = getStudioMarket();
  const params = useMemo(
    () => ({ ...DEFAULT_MINING_PARAMETERS, hashprice: market.hashprice, asOf: market.asOf, source: market.source }),
    [market.hashprice, market.asOf, market.source],
  );
  const [copied, setCopied] = useState(false);
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
    const url = `${window.location.pathname}?s=${encode({ i: investment, a: access })}`;
    window.history.replaceState(null, '', url);
  }, [investment, access]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

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
        <motion.section {...reveal} style={{ display: 'grid', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <span className="eyebrow">01 · ARN investment</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="pill" onClick={() => window.print()}>Export PDF</button>
              <button className="pill" onClick={copyLink}>
                <Icon name={copied ? 'arn' : 'copy'} size={13} />
                {copied ? 'Link copied' : 'Share'}
              </button>
            </div>
          </div>
          <InvestmentPanel value={investment} onChange={(patch) => setInvestment((prev) => ({ ...prev, ...patch }))} />
        </motion.section>

        <motion.section {...reveal} style={{ display: 'grid', gap: 16 }}>
          <span className="eyebrow">02 · Access &amp; node</span>
          <AccessPanel value={access} onChange={(patch) => setAccess((prev) => ({ ...prev, ...patch }))} />
        </motion.section>

        <LegalFooter asOf={params.asOf} source="aerion-tokenomics-simulation" />
      </main>
    </>
  );
}
