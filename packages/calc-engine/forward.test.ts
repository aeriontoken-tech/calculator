import { describe, it, expect } from 'vitest';
import { computeForwardEconomics } from './forward';
import type { MinerInputs } from './types';

const base: MinerInputs = { hashrateTH: 234, efficiencyJPerTH: 15, energyEurPerKwh: 0.06, uptime: 0.85, poolFee: 0.02, overhead: 0.08, omPerDay: 1.2, capex: 2000 };

describe('computeForwardEconomics', () => {
  it('with 0% decline, payback matches the documented snapshot (~51 months / 4.21yr)', () => {
    const r = computeForwardEconomics(base, 36.63, { horizonMonths: 120, hashpriceMonthlyChangePct: 0, discountAnnualPct: 0 });
    expect(r.paybackMonths).toBe(51);
  });
  it('decline lengthens payback vs no decline', () => {
    const flat = computeForwardEconomics(base, 36.63, { horizonMonths: 120, hashpriceMonthlyChangePct: 0, discountAnnualPct: 0 });
    const declining = computeForwardEconomics(base, 36.63, { horizonMonths: 120, hashpriceMonthlyChangePct: -0.03, discountAnnualPct: 0 });
    expect((declining.paybackMonths ?? 999)).toBeGreaterThan(flat.paybackMonths!);
  });
  it('with 0 discount and 0 decline, npv ~= totalProfit', () => {
    const r = computeForwardEconomics(base, 36.63, { horizonMonths: 120, hashpriceMonthlyChangePct: 0, discountAnnualPct: 0 });
    expect(r.npv).toBeCloseTo(r.totalProfit, 6);
  });
  it('discounting reduces npv below undiscounted profit', () => {
    const r = computeForwardEconomics(base, 36.63, { horizonMonths: 120, hashpriceMonthlyChangePct: 0, discountAnnualPct: 0.12 });
    expect(r.npv).toBeLessThan(r.totalProfit);
  });
});
