'use client';

import type { ForwardAssumptions } from '@/packages/calc-engine';
import { RangeField, Segmented } from './primitives';
import { Src } from './SourceTag';

export function MarketStrip({
  a,
  onChange,
  asOf,
  hashprice,
}: {
  a: ForwardAssumptions;
  onChange: (patch: Partial<ForwardAssumptions>) => void;
  asOf: string;
  hashprice: number;
}) {
  return (
    <div className="glass" style={{ padding: '18px 22px', display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <span className="eyebrow no-rule">
          Market &amp; horizon <Src k="decline" />
        </span>
        <span className="faint" style={{ fontSize: 10.5 }}>
          hashprice €{hashprice}/PH·day · as of {asOf} <Src k="hashprice" />
        </span>
      </div>
      <div className="market-grid" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr', gap: 26, alignItems: 'center' }}>
        <div style={{ display: 'grid', gap: 8 }}>
          <span className="label">Horizon</span>
          <Segmented
            value={String(a.horizonMonths)}
            onChange={(v) => onChange({ horizonMonths: Number(v) })}
            options={[12, 24, 36, 48, 60].map((m) => ({ value: String(m), label: `${m}mo` }))}
          />
        </div>
        <RangeField
          label="Hashprice change / month"
          unit="difficulty drift"
          value={a.hashpriceMonthlyChangePct}
          min={-0.08}
          max={0.02}
          step={0.005}
          onChange={(v) => onChange({ hashpriceMonthlyChangePct: v })}
          display={(v) => `${(v * 100).toFixed(1)}%`}
        />
        <RangeField
          label="Discount rate / year"
          value={a.discountAnnualPct}
          min={0}
          max={0.3}
          step={0.01}
          onChange={(v) => onChange({ discountAnnualPct: v })}
          display={(v) => `${Math.round(v * 100)}%`}
        />
      </div>
    </div>
  );
}
