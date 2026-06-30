import { describe, it, expect } from 'vitest';
import { computeMinerEconomics, computeSiteEconomics } from './mining';
import type { MinerInputs, SiteInputs } from './types';

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

const site = (over: Partial<SiteInputs> = {}): SiteInputs => ({
  capacityMW: 5,
  capacityFactor: 0.25,
  energySharePct: 0.1,
  miner: base(),
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

describe('computeSiteEconomics — documented 5 MW wind example', () => {
  it('10% share: ~125 avg kW, ~33 miners, ~€20,957/yr margin, ~3.15yr payback', () => {
    const r = computeSiteEconomics(site(), 36.63);
    expect(r.annualGenMwh).toBeCloseTo(10950, 0);
    expect(r.aerionShareMwh).toBeCloseTo(1095, 0);
    expect(r.avgKW).toBeCloseTo(125, 0);
    expect(r.supportedMiners).toBeCloseTo(33, 0);
    expect(r.energyCostYear).toBeCloseTo(65700, -2);
    expect(r.marginYear).toBeCloseTo(20957, -2);
    expect(r.paybackYears).toBeCloseTo(3.15, 1);
  });

  it('15% share: ~49.5 miners, ~€31,436/yr margin, ~3.15yr payback', () => {
    const r = computeSiteEconomics(site({ energySharePct: 0.15 }), 36.63);
    expect(r.supportedMiners).toBeCloseTo(49.5, 0);
    expect(r.marginYear).toBeCloseTo(31436, -2);
    expect(r.paybackYears).toBeCloseTo(3.15, 1);
  });
});
