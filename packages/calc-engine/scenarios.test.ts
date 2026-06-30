import { describe, it, expect } from 'vitest';
import { runMiningScenarioBand } from './scenarios';
import { DEFAULT_MINING_PARAMETERS } from './parameters';
import type { MinerInputs } from './types';

const base: MinerInputs = {
  hashrateTH: 234,
  efficiencyJPerTH: 15,
  energyEurPerKwh: 0.06,
  uptime: 0.85,
  poolFee: 0.02,
  overhead: 0.08,
  omPerDay: 1.2,
  capex: 2000,
};

describe('runMiningScenarioBand', () => {
  it('orders margins conservative < base < optimistic', () => {
    const band = runMiningScenarioBand(base, DEFAULT_MINING_PARAMETERS);
    expect(band.conservative.marginDay).toBeLessThan(band.base.marginDay);
    expect(band.base.marginDay).toBeLessThan(band.optimistic.marginDay);
  });

  it('base equals the documented base scenario', () => {
    const band = runMiningScenarioBand(base, DEFAULT_MINING_PARAMETERS);
    expect(band.base.marginDay).toBeCloseTo(1.3, 1);
  });

  it('never sets optimistic uptime above 1.0', () => {
    const band = runMiningScenarioBand({ ...base, uptime: 0.98 }, DEFAULT_MINING_PARAMETERS);
    // uptime 0.98 * 1.06 = 1.04 -> capped at 1.0; revenue must equal full-uptime revenue
    expect(band.optimistic.revenueDay).toBeCloseTo(
      (234 / 1000) * (DEFAULT_MINING_PARAMETERS.hashprice * 1.2) * 1.0 * (1 - 0.02),
      2,
    );
  });

  it('passes through documented payback percentiles', () => {
    const band = runMiningScenarioBand(base, DEFAULT_MINING_PARAMETERS);
    expect(band.paybackPercentiles.p50).toBeCloseTo(2.014, 2);
  });
});
