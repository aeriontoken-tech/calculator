'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ENV_KEYS, MARKET_DEFAULTS, getStudioMarket, type StudioMarket } from '@/lib/market';

export default function AdminPage() {
  const [m, setM] = useState<StudioMarket>(() => getStudioMarket());
  const [copied, setCopied] = useState(false);
  const set = (patch: Partial<StudioMarket>) => setM((prev) => ({ ...prev, ...patch }));

  const envBlock = useMemo(
    () =>
      [
        `${ENV_KEYS.hashprice}=${m.hashprice}`,
        `${ENV_KEYS.asOf}=${m.asOf}`,
        `${ENV_KEYS.source}=${m.source}`,
        `${ENV_KEYS.declinePctMonthly}=${m.declinePctMonthly}`,
        `${ENV_KEYS.discountAnnualPct}=${m.discountAnnualPct}`,
      ].join('\n'),
    [m],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(envBlock);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  // plain render function (NOT a nested component) so inputs don't remount / lose focus
  const field = (label: string, k: keyof StudioMarket, step?: number, type: string = 'number') => (
    <label style={{ display: 'grid', gap: 6 }}>
      <span className="label">{label}</span>
      <input
        className="field-input"
        type={type}
        step={step}
        value={String(m[k])}
        onChange={(e) => set({ [k]: type === 'number' ? Number(e.target.value) : e.target.value } as Partial<StudioMarket>)}
      />
    </label>
  );

  return (
    <main style={{ position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto', padding: '48px 22px 90px', display: 'grid', gap: 26 }}>
      <div>
        <Link href="/" className="pill" style={{ textDecoration: 'none' }}>← Back to the studio</Link>
      </div>
      <header>
        <p className="eyebrow">Internal · market configuration</p>
        <h1 className="display" style={{ fontSize: 'clamp(30px, 4.4vw, 44px)', marginTop: 12 }}>Curated market inputs<span className="dot">.</span></h1>
        <p className="muted" style={{ marginTop: 12, fontSize: 13.5 }}>
          Edit the dated, curated market inputs every studio figure derives from. Copy the generated environment block into
          your hosting dashboard (e.g. Vercel → Settings → Environment Variables) and redeploy to apply — no code change.
        </p>
      </header>

      <section className="glass" style={{ padding: 26, display: 'grid', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {field('Hashprice · €/PH·day', 'hashprice', 0.01)}
          {field('As of (date)', 'asOf', undefined, 'text')}
          {field('Difficulty drift · /month (e.g. -0.01)', 'declinePctMonthly', 0.005)}
          {field('Discount rate · /year (e.g. 0.12)', 'discountAnnualPct', 0.01)}
        </div>
        {field('Source note', 'source', undefined, 'text')}
        <button className="pill" style={{ width: 'fit-content' }} onClick={() => setM(MARKET_DEFAULTS)}>Reset to defaults</button>
      </section>

      <section className="glass" style={{ padding: 26, display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="eyebrow no-rule">Environment block</span>
          <button className="pill pill-accent" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>
        </div>
        <pre className="meta" style={{ whiteSpace: 'pre-wrap', margin: 0, fontSize: 12, background: 'var(--paper-3)', padding: 14, borderRadius: 'var(--r-sm)', border: '1px solid var(--line)' }}>{envBlock}</pre>
        <p className="faint" style={{ fontSize: 11 }}>
          Values are read at build time via <code>NEXT_PUBLIC_*</code>. For live, no-redeploy editing, wire these keys to a
          runtime store (e.g. Vercel Edge Config) — the studio reads them the same way.
        </p>
      </section>
    </main>
  );
}
