import Link from 'next/link';
import { DEFAULT_MINING_PARAMETERS } from '@/packages/calc-engine';
import { INPUTS } from '@/lib/inputs-registry';

export const metadata = { title: 'Aerion — Methodology & Assumptions' };

export default function MethodologyPage() {
  const p = DEFAULT_MINING_PARAMETERS;
  const rows = Object.entries(INPUTS);
  return (
    <main style={{ position: 'relative', zIndex: 1, maxWidth: 860, margin: '0 auto', padding: '48px 22px 90px', display: 'grid', gap: 30 }}>
      <div>
        <Link href="/" className="pill" style={{ textDecoration: 'none' }}>← Back to the studio</Link>
      </div>

      <header>
        <p className="eyebrow">Methodology &amp; assumptions</p>
        <h1 className="display" style={{ fontSize: 'clamp(34px, 5vw, 52px)', marginTop: 14 }}>
          Every number, traceable<span className="dot">.</span>
        </h1>
        <p className="muted" style={{ marginTop: 14, maxWidth: 620 }}>
          The studio is a forward-looking scenario tool, not a forecast. Below is exactly how each figure is computed and
          which inputs are confirmed versus illustrative.
        </p>
      </header>

      <section className="glass" style={{ padding: 28, display: 'grid', gap: 14 }}>
        <p className="eyebrow no-rule">Forward mining model</p>
        <p className="muted" style={{ fontSize: 13.5 }}>
          Each miner is projected month by month over the chosen horizon. Hashprice drifts by a difficulty-growth factor;
          a rational operator (Aerion&apos;s AI Operator) idles a miner in any month its spread turns negative, so losses
          never accumulate.
        </p>
        <pre className="meta" style={{ whiteSpace: 'pre-wrap', margin: 0, fontSize: 12 }}>{`hashprice(m)   = hashprice0 · (1 + monthlyChange)^m
revenue/day    = (TH/1000) · hashprice(m) · uptime · (1 − poolFee)
margin/day     = revenue/day − energyCost/day − O&M/day
month margin   = max(0, margin/day) · 30.44        (idle when negative)
payback        = first month cumulative ≥ 0
NPV            = −capex + Σ month margin / (1 + r)^m,   r = (1+discount)^(1/12) − 1`}</pre>
      </section>

      <section className="glass" style={{ padding: 28, display: 'grid', gap: 14 }}>
        <p className="eyebrow no-rule">Monte-Carlo range</p>
        <p className="muted" style={{ fontSize: 13.5 }}>
          Each module runs a seeded 240-path simulation, varying hashprice level, difficulty drift, delivered energy, and
          uptime. The P10 / P50 / P90 of payback and NPV form the range you see. The seed is derived from the module, so
          results are reproducible and update live as you tune inputs.
        </p>
      </section>

      <section className="glass" style={{ padding: 28, display: 'grid', gap: 16 }}>
        <p className="eyebrow no-rule">Inputs · confirmed vs illustrative</p>
        <div style={{ display: 'grid', gap: 10 }}>
          {rows.map(([k, m]) => (
            <div key={k} style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 14, alignItems: 'start', borderTop: '1px solid var(--line)', paddingTop: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className={`src src-${m.status}`}>{m.status === 'illustrative' ? '~' : '✓'}</span>
                <span className="label" style={{ color: m.status === 'illustrative' ? '#9a7b3c' : 'var(--mint-ink)' }}>{k}</span>
              </div>
              <span className="faint" style={{ fontSize: 12 }}>{m.source}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="glass" style={{ padding: 28, display: 'grid', gap: 12 }}>
        <p className="eyebrow no-rule">Reference values</p>
        <ul className="meta" style={{ margin: 0, paddingLeft: 18, lineHeight: 1.9 }}>
          <li>Reference miner: {p.defaults.hashrateTH} TH/s @ {p.defaults.efficiencyJPerTH} J/TH · overhead {Math.round(p.defaults.overhead * 100)}% · pool fee {Math.round(p.defaults.poolFee * 100)}% · O&amp;M €{p.defaults.omPerDay}/day · capex €{p.defaults.capex} <span className="src src-illustrative">~</span></li>
          <li>Base hashprice €{p.hashprice}/PH·day, as of {p.asOf} ({p.source})</li>
          <li>Sale rounds &amp; vesting: Seed €0.02 / Private €0.05 / Public €0.10 with documented cliffs and linear vesting <span className="src src-confirmed">✓</span></li>
          <li>Documented Monte-Carlo (whitepaper simulation): miner payback P10 1.67 · P50 2.01 · P90 2.49 yr; POMP reserve ~97% locked (P50); absorption coverage 8.15× at month 48 (P50)</li>
        </ul>
      </section>

      <footer className="glass" style={{ padding: '22px 26px' }}>
        <p className="faint" style={{ fontSize: 11.5, margin: 0 }}>
          Illustrative scenarios only — estimates based on assumptions you control, not a forecast and not a guarantee.
          Not investment advice. Capital is at risk. This crypto-asset marketing communication has not been reviewed or
          approved by any competent authority in any Member State of the European Union. The offeror of the crypto-asset
          is solely responsible for the content of this marketing communication.
        </p>
      </footer>
    </main>
  );
}
