'use client';

import { useMemo, useState } from 'react';
import {
  computeMinerEconomics,
  runMiningScenarioBand,
  type MinerInputs,
  type MiningParameters,
} from '@/packages/calc-engine';
import { SliderNumber } from '@/components/inputs/SliderNumber';
import { PresetSelect } from '@/components/inputs/PresetSelect';
import { MarginCurve } from '@/components/charts/MarginCurve';
import { ScenarioBand } from '@/components/charts/ScenarioBand';
import { Disclaimer } from '@/components/compliance/Disclaimer';
import { AsOfStamp } from '@/components/compliance/AsOfStamp';
import { formatEur2, formatYears } from '@/lib/format';

const MINER_PRESETS = [
  { label: '234 TH/s · 15 J/TH (default)', value: 'default' },
  { label: '200 TH/s · 17 J/TH', value: 's19' },
] as const;

const PRESET_SPECS: Record<string, { hashrateTH: number; efficiencyJPerTH: number }> = {
  default: { hashrateTH: 234, efficiencyJPerTH: 15 },
  s19: { hashrateTH: 200, efficiencyJPerTH: 17 },
};

export function MiningModule({ parameters }: { parameters: MiningParameters }) {
  const d = parameters.defaults;
  const [preset, setPreset] = useState<string>('default');
  const [inputs, setInputs] = useState<MinerInputs>({
    hashrateTH: d.hashrateTH,
    efficiencyJPerTH: d.efficiencyJPerTH,
    energyEurPerKwh: 0.06,
    uptime: 0.85,
    poolFee: d.poolFee,
    overhead: d.overhead,
    omPerDay: d.omPerDay,
    capex: d.capex,
  });

  const set = (patch: Partial<MinerInputs>) => setInputs((prev) => ({ ...prev, ...patch }));

  const result = useMemo(() => computeMinerEconomics(inputs, parameters.hashprice), [inputs, parameters.hashprice]);
  const band = useMemo(() => runMiningScenarioBand(inputs, parameters), [inputs, parameters]);

  return (
    <section>
      <p className="section-label">Mining · Performance</p>
      <h2 style={{ fontSize: 34, margin: '8px 0 24px' }}>
        What the energy actually earns<span className="dot">.</span>
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'calc(var(--space) * 4)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'calc(var(--space) * 2)' }}>
          <PresetSelect
            label="Miner"
            value={preset}
            options={MINER_PRESETS as unknown as { label: string; value: string }[]}
            onChange={(v) => {
              setPreset(v);
              set(PRESET_SPECS[v]);
            }}
          />
          <SliderNumber label="Energy price" unit="€/kWh" value={inputs.energyEurPerKwh} min={0} max={0.2} step={0.005} onChange={(v) => set({ energyEurPerKwh: v })} />
          <SliderNumber label="Uptime" unit="fraction" value={inputs.uptime} min={0} max={1} step={0.01} onChange={(v) => set({ uptime: v })} />
        </div>

        <div>
          <div style={{ display: 'flex', gap: 'calc(var(--space) * 4)', marginBottom: 'calc(var(--space) * 2)' }}>
            <div>
              <p className="meta">CASH MARGIN / DAY</p>
              <p data-testid="margin-day" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 32, margin: 0 }}>
                {formatEur2(result.marginDay)}
              </p>
            </div>
            <div>
              <p className="meta">SIMPLE PAYBACK</p>
              <p data-testid="payback" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 32, margin: 0 }}>
                {formatYears(result.paybackYears)}
              </p>
            </div>
            <div>
              <p className="meta">BREAKEVEN ENERGY</p>
              <p data-testid="breakeven" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 32, margin: 0 }}>
                {formatEur2(result.breakevenEnergyEurPerKwh)}
              </p>
            </div>
          </div>
          <MarginCurve inputs={inputs} hashprice={parameters.hashprice} energyMin={0} energyMax={0.12} />
        </div>
      </div>

      <hr className="rule" />
      <p className="section-label">Scenario range</p>
      <ScenarioBand band={band} />
      <p className="meta" style={{ marginTop: 'var(--space)' }}>
        Documented Monte-Carlo miner payback: P10 {band.paybackPercentiles.p10.toFixed(2)} yr · P50{' '}
        {band.paybackPercentiles.p50.toFixed(2)} yr · P90 {band.paybackPercentiles.p90.toFixed(2)} yr.
      </p>

      <hr className="rule" />
      <AsOfStamp asOf={parameters.asOf} source={parameters.source} />
      <div style={{ marginTop: 'calc(var(--space) * 2)' }}>
        <Disclaimer />
      </div>
    </section>
  );
}
