import { describe, it, expect } from 'vitest';
import { computeModule, computePortfolio } from './studio';
import type { ModuleConfig } from './studio';
import { DEFAULT_MINING_PARAMETERS } from '@/packages/calc-engine';
import type { ForwardAssumptions } from '@/packages/calc-engine';

const assumptions: ForwardAssumptions = {
  horizonMonths: 36,
  hashpriceMonthlyChangePct: -0.01,
  discountAnnualPct: 0.12,
};

function makeConfig(overrides: Partial<ModuleConfig> = {}): ModuleConfig {
  return {
    id: 'test-module',
    presetKey: 'custom',
    name: 'Test Miner',
    location: 'Anywhere',
    energyType: 'custom',
    energyEurPerKwh: 0.06,
    uptime: 0.85,
    minerCount: 10,
    hashrateTH: DEFAULT_MINING_PARAMETERS.defaults.hashrateTH,
    efficiencyJPerTH: DEFAULT_MINING_PARAMETERS.defaults.efficiencyJPerTH,
    ...overrides,
  };
}

describe('computeModule', () => {
  const cfg = makeConfig({ minerCount: 10 });
  const result = computeModule(cfg, DEFAULT_MINING_PARAMETERS, assumptions);

  it('marginDay equals 10 × perMiner.marginDay', () => {
    expect(result.marginDay).toBeCloseTo(result.perMiner.marginDay * 10, 6);
  });

  it('capex equals 10 × params.defaults.capex (= 20000)', () => {
    expect(result.capex).toBe(DEFAULT_MINING_PARAMETERS.defaults.capex * 10);
    expect(result.capex).toBe(20000);
  });

  it('mc percentiles are all numbers', () => {
    expect(typeof result.mc.npvP10).toBe('number');
    expect(typeof result.mc.npvP50).toBe('number');
    expect(typeof result.mc.npvP90).toBe('number');
  });

  it('cashflow.length equals assumptions.horizonMonths', () => {
    expect(result.cashflow).toHaveLength(assumptions.horizonMonths);
  });
});

describe('computePortfolio', () => {
  const cfgA = makeConfig({ id: 'module-a', minerCount: 5 });
  const cfgB = makeConfig({ id: 'module-b', minerCount: 8 });
  const resultA = computeModule(cfgA, DEFAULT_MINING_PARAMETERS, assumptions);
  const resultB = computeModule(cfgB, DEFAULT_MINING_PARAMETERS, assumptions);
  const portfolio = computePortfolio([resultA, resultB]);

  it('portfolio capex = sum of module capex values', () => {
    expect(portfolio.capex).toBeCloseTo(resultA.capex + resultB.capex, 6);
  });

  it('portfolio marginDay = sum of module marginDay values', () => {
    expect(portfolio.marginDay).toBeCloseTo(resultA.marginDay + resultB.marginDay, 6);
  });

  it('portfolio npv = sum of module npv values', () => {
    expect(portfolio.npv).toBeCloseTo(resultA.npv + resultB.npv, 6);
  });
});
