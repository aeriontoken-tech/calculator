import { describe, it, expect } from 'vitest';
import { DEFAULT_MINING_PARAMETERS } from './parameters';

describe('DEFAULT_MINING_PARAMETERS', () => {
  it('carries documented mining constants', () => {
    expect(DEFAULT_MINING_PARAMETERS.hashprice).toBe(36.63);
    expect(DEFAULT_MINING_PARAMETERS.defaults.hashrateTH).toBe(234);
    expect(DEFAULT_MINING_PARAMETERS.defaults.efficiencyJPerTH).toBe(15);
    expect(DEFAULT_MINING_PARAMETERS.defaults.overhead).toBe(0.08);
    expect(DEFAULT_MINING_PARAMETERS.defaults.poolFee).toBe(0.02);
    expect(DEFAULT_MINING_PARAMETERS.defaults.omPerDay).toBe(1.2);
    expect(DEFAULT_MINING_PARAMETERS.defaults.capex).toBe(2000);
  });

  it('carries a source attribution and an as-of date', () => {
    expect(DEFAULT_MINING_PARAMETERS.source).toMatch(/summary\.json/);
    expect(DEFAULT_MINING_PARAMETERS.asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('carries documented payback percentiles', () => {
    expect(DEFAULT_MINING_PARAMETERS.paybackPercentiles.p50).toBeCloseTo(2.014, 2);
  });
});
