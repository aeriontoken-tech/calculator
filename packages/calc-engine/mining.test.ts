import { describe, it, expect } from 'vitest';
import { computeMinerEconomics } from './mining';
import type { MinerInputs } from './types';

const base = (over: Partial<MinerInputs> = {}): MinerInputs => ({
  hashrateTH: 234,
  efficiencyJPerTH: 15,
  energyEurPerKwh: 0.06,
  uptime: 0.85,
  poolFee: 0.02,
  overhead: 0.08,
  omPerDay: 1.2,
  capex: 2000,
  ...over,
});

describe('computeMinerEconomics — documented scenarios', () => {
  it('Base direct access: margin ~€1.30/day, payback ~4.21yr', () => {
    const r = computeMinerEconomics(base(), 36.63);
    expect(r.powerKW).toBeCloseTo(3.51, 2);
    expect(r.energyCostDay).toBeCloseTo(4.64, 1);
    expect(r.revenueDay).toBeCloseTo(7.14, 1);
    expect(r.marginDay).toBeCloseTo(1.3, 1);
    expect(r.paybackYears).toBeCloseTo(4.21, 1);
    expect(r.breakevenEnergyEurPerKwh).toBeCloseTo(0.102, 2);
  });

  it('Surplus blend (€0.04, 75%): margin ~€2.37/day, payback ~2.31yr', () => {
    const r = computeMinerEconomics(base({ energyEurPerKwh: 0.04, uptime: 0.75 }), 36.63);
    expect(r.marginDay).toBeCloseTo(2.37, 1);
    expect(r.paybackYears).toBeCloseTo(2.31, 1);
  });

  it('Upside (hashprice 50, €0.04, 90%): margin ~€5.84/day, payback ~0.94yr', () => {
    const r = computeMinerEconomics(base({ energyEurPerKwh: 0.04, uptime: 0.9 }), 50);
    expect(r.marginDay).toBeCloseTo(5.84, 1);
    expect(r.paybackYears).toBeCloseTo(0.94, 1);
  });

  it('Stress (hashprice 25, €0.10, 70%): negative margin, payback null', () => {
    const r = computeMinerEconomics(base({ energyEurPerKwh: 0.1, uptime: 0.7 }), 25);
    expect(r.marginDay).toBeLessThan(0);
    expect(r.paybackYears).toBeNull();
  });
});
