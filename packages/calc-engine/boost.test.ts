import { describe, it, expect } from 'vitest';
import { computeBoost, accessShare, licenseForStake } from './boost';

describe('computeBoost', () => {
  it('returns 0 when ineligible, regardless of stake', () => {
    const result = computeBoost({ stake: 50000, uptime: 0.9, reputation: 0.8, taskQuality: 0.8, eligible: false });
    expect(result).toBe(0);
  });

  it('is concave in stake: boost(20000) < 2 × boost(10000)', () => {
    const common = { uptime: 0.9, reputation: 0.8, taskQuality: 0.8, eligible: true };
    const b10 = computeBoost({ stake: 10000, ...common });
    const b20 = computeBoost({ stake: 20000, ...common });
    expect(b20).toBeLessThan(2 * b10);
  });
});

describe('accessShare', () => {
  it('returns a value strictly between 0 and 1', () => {
    const share = accessShare(1.5, 1.0, 10);
    expect(share).toBeGreaterThan(0);
    expect(share).toBeLessThan(1);
  });

  it('larger userBoost yields a larger share than smaller userBoost', () => {
    const competitorBoost = 1.0;
    const poolN = 10;
    const shareHigh = accessShare(2.0, competitorBoost, poolN);
    const shareLow = accessShare(0.5, competitorBoost, poolN);
    expect(shareHigh).toBeGreaterThan(shareLow);
  });
});

describe('licenseForStake', () => {
  it('stake 0 → Founding Access Pass', () => {
    const cls = licenseForStake(0);
    expect(cls.key).toBe('access');
    expect(cls.name).toBe('Founding Access Pass');
  });

  it('stake 25000 → Verifier Seat', () => {
    const cls = licenseForStake(25000);
    expect(cls.key).toBe('verifier');
    expect(cls.name).toBe('Verifier Seat');
  });

  it('stake 30000 → Verifier Seat (above minStake 25000)', () => {
    const cls = licenseForStake(30000);
    expect(cls.key).toBe('verifier');
  });

  it('stake 100000 → Site Partner Node', () => {
    const cls = licenseForStake(100000);
    expect(cls.key).toBe('partner');
    expect(cls.name).toBe('Site Partner Node');
  });
});
