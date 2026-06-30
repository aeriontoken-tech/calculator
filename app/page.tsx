import Link from 'next/link';
import { RiskBanner } from '@/components/compliance/RiskBanner';
import { MicaStatement } from '@/components/compliance/MicaStatement';

export default function Home() {
  return (
    <main className="page">
      <RiskBanner />
      <p className="section-label">Aerion · Scenario Calculator</p>
      <h1 style={{ fontSize: 52, margin: '12px 0 16px' }}>
        Model the economics, not a promise<span className="dot">.</span>
      </h1>
      <p style={{ maxWidth: 640, color: 'var(--muted-cream)' }}>
        Explore illustrative scenarios for Aerion mining and site economics. Every figure is an
        estimate based on assumptions you control — not a forecast and not a guarantee.
      </p>
      <p style={{ marginTop: 'calc(var(--space) * 3)' }}>
        <Link href="/mining">Open the mining module →</Link>
        {'   '}
        <Link href="/methodology">Methodology &amp; assumptions →</Link>
      </p>
      <hr className="rule" />
      <MicaStatement />
    </main>
  );
}
