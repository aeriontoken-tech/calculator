import { describe, it, expect } from 'vitest';
import { runMonteCarlo } from './montecarlo';
import type { MinerInputs } from './types';

const base: MinerInputs = { hashrateTH: 234, efficiencyJPerTH: 15, energyEurPerKwh: 0.06, uptime: 0.85, poolFee: 0.02, overhead: 0.08, omPerDay: 1.2, capex: 2000 };
const a = { horizonMonths: 60, hashpriceMonthlyChangePct: -0.02, discountAnnualPct: 0.1 };

describe('runMonteCarlo', () => {
  it('is deterministic for a fixed seed', () => {
    const r1 = runMonteCarlo(base, 36.63, a, undefined, 42);
    const r2 = runMonteCarlo(base, 36.63, a, undefined, 42);
    expect(r1).toEqual(r2);
  });
  it('orders npv percentiles p10 <= p50 <= p90', () => {
    const r = runMonteCarlo(base, 36.63, a, undefined, 7);
    expect(r.npvP10).toBeLessThanOrEqual(r.npvP50);
    expect(r.npvP50).toBeLessThanOrEqual(r.npvP90);
  });
});
