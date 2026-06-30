import type { ScenarioBand as ScenarioBandData } from '@/packages/calc-engine';
import { formatEur2, formatYears } from '@/lib/format';

const ROWS = [
  { key: 'conservative', label: 'Conservative' },
  { key: 'base', label: 'Base' },
  { key: 'optimistic', label: 'Optimistic' },
] as const;

export function ScenarioBand({ band }: { band: ScenarioBandData }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
      <thead>
        <tr style={{ color: 'var(--muted-cream)', textAlign: 'left' }}>
          <th style={{ padding: '6px 0' }}>SCENARIO</th>
          <th style={{ padding: '6px 0' }}>MARGIN / DAY</th>
          <th style={{ padding: '6px 0' }}>PAYBACK</th>
        </tr>
      </thead>
      <tbody>
        {ROWS.map((r) => {
          const res = band[r.key];
          const isBase = r.key === 'base';
          return (
            <tr key={r.key} style={{ borderTop: '1px solid var(--rule)' }}>
              <td style={{ padding: '8px 0', color: isBase ? 'var(--cream)' : 'var(--muted-cream)' }}>
                {isBase ? <span className="dot">●</span> : null} {r.label}
              </td>
              <td style={{ padding: '8px 0' }}>{formatEur2(res.marginDay)}</td>
              <td style={{ padding: '8px 0' }}>{formatYears(res.paybackYears)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
