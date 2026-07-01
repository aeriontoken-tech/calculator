import { describe, it, expect } from 'vitest';
import { computeAllocation, computeVesting, SALE_ROUNDS } from './allocation';

describe('computeAllocation — public round', () => {
  const publicRound = SALE_ROUNDS[2]; // { priceEur: 0.1, cliffMonths: 9, cliffUnlock: 0.2, linearMonths: 12 }

  it('computes gross ARN, received ARN, bonus, and cost basis correctly', () => {
    const r = computeAllocation({
      amountEur: 5000,
      round: publicRound,
      dashboardBonusPct: 0.03,
      hypotheticalPriceEur: null,
    });
    expect(r.arnGross).toBe(50000);
    expect(r.arnReceived).toBe(51500);
    expect(r.bonusArn).toBe(1500);
    expect(r.costBasisEur).toBeCloseTo(5000 / 51500, 6); // ≈ 0.0971
    expect(r.hypotheticalValueEur).toBeNull();
  });

  it('returns hypotheticalValueEur when a price is supplied', () => {
    const r = computeAllocation({
      amountEur: 5000,
      round: publicRound,
      dashboardBonusPct: 0.03,
      hypotheticalPriceEur: 0.4,
    });
    expect(r.hypotheticalValueEur).toBeCloseTo(51500 * 0.4, 4); // ≈ 20600
  });
});

describe('computeVesting — public round, 51500 ARN, 36 months', () => {
  const publicRound = SALE_ROUNDS[2]; // cliffMonths=9, cliffUnlock=0.2, linearMonths=12
  const pts = computeVesting(publicRound, 51500, 36);

  it('returns 37 points (months 0 through 36)', () => {
    expect(pts).toHaveLength(37);
    expect(pts[0].month).toBe(0);
    expect(pts[36].month).toBe(36);
  });

  it('unlockedFraction is 0 before the cliff month', () => {
    for (let m = 0; m < publicRound.cliffMonths; m++) {
      expect(pts[m].unlockedFraction).toBe(0);
    }
  });

  it('unlockedFraction is monotonically non-decreasing', () => {
    for (let i = 1; i < pts.length; i++) {
      expect(pts[i].unlockedFraction).toBeGreaterThanOrEqual(pts[i - 1].unlockedFraction);
    }
  });

  it('reaches ~1.0 by month 36 and unlockedArn ≈ 51500', () => {
    const last = pts[36];
    expect(last.unlockedFraction).toBeCloseTo(1, 6);
    expect(last.unlockedArn).toBeCloseTo(51500, 1);
  });
});
