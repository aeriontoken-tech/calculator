import {
  computeMinerEconomics,
  runMiningScenarioBand,
  computeForwardEconomics,
  runMonteCarlo,
  DEFAULT_MC,
  type MinerInputs,
  type MinerResult,
  type MiningParameters,
  type ScenarioBand,
  type ForwardAssumptions,
  type McResult,
} from '@/packages/calc-engine';
import type { EnergyType } from './presets';

export interface ModuleConfig {
  id: string;
  presetKey: string;
  name: string;
  location: string;
  energyType: EnergyType;
  energyEurPerKwh: number;
  uptime: number;
  minerCount: number;
  hashrateTH: number;
  efficiencyJPerTH: number;
}

// Lifted panel state so the whole studio can be shared via URL.
export interface InvestmentState {
  roundKey: 'seed' | 'private' | 'public';
  amount: number;
  dashboard: boolean;
  horizon: number;
  scenario: number | null;
  customPrice: string;
}
export const DEFAULT_INVESTMENT: InvestmentState = {
  roundKey: 'public',
  amount: 5000,
  dashboard: true,
  horizon: 24,
  scenario: 0.4,
  customPrice: '',
};

export interface AccessState {
  stake: number;
  uptime: number;
  reputation: number;
  taskQuality: number;
  eligible: boolean;
  poolN: number;
}
export const DEFAULT_ACCESS: AccessState = {
  stake: 25000,
  uptime: 0.95,
  reputation: 0.8,
  taskQuality: 0.8,
  eligible: true,
  poolN: 250,
};

export interface CashPoint {
  month: number;
  cumulative: number;
}

export interface ModuleResult {
  perMiner: MinerResult;
  band: ScenarioBand;
  minerCount: number;
  revenueDay: number;
  energyCostDay: number;
  marginDay: number;
  capex: number;
  powerKW: number;
  hashratePH: number;
  paybackYears: number | null; // snapshot (no decline)
  // forward (multi-year, with decline + horizon)
  forwardPaybackMonths: number | null;
  npv: number; // fleet NPV over horizon
  roiPct: number;
  mc: McResult; // percentiles: payback months (fleet-invariant), NPV scaled to fleet
  cashflow: CashPoint[]; // fleet cumulative cash flow
}

export function moduleToMinerInputs(cfg: ModuleConfig, params: MiningParameters): MinerInputs {
  const d = params.defaults;
  return {
    hashrateTH: cfg.hashrateTH,
    efficiencyJPerTH: cfg.efficiencyJPerTH,
    energyEurPerKwh: cfg.energyEurPerKwh,
    uptime: cfg.uptime,
    poolFee: d.poolFee,
    overhead: d.overhead,
    omPerDay: d.omPerDay,
    capex: d.capex,
  };
}

function seedFrom(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function computeModule(cfg: ModuleConfig, params: MiningParameters, a: ForwardAssumptions): ModuleResult {
  const inputs = moduleToMinerInputs(cfg, params);
  const perMiner = computeMinerEconomics(inputs, params.hashprice);
  const band = runMiningScenarioBand(inputs, params);
  const n = Math.max(0, cfg.minerCount);

  const fwd = computeForwardEconomics(inputs, params.hashprice, a);
  const mcRaw = runMonteCarlo(inputs, params.hashprice, a, { ...DEFAULT_MC, paths: 240 }, seedFrom(cfg.id));

  const marginDay = perMiner.marginDay * n;
  return {
    perMiner,
    band,
    minerCount: n,
    revenueDay: perMiner.revenueDay * n,
    energyCostDay: perMiner.energyCostDay * n,
    marginDay,
    capex: params.defaults.capex * n,
    powerKW: perMiner.powerKW * n,
    hashratePH: (cfg.hashrateTH / 1000) * n,
    paybackYears: marginDay > 0 ? (params.defaults.capex * n) / marginDay / 365 : null,
    forwardPaybackMonths: fwd.paybackMonths,
    npv: fwd.npv * n,
    roiPct: fwd.roiPct,
    mc: {
      paybackP10: mcRaw.paybackP10,
      paybackP50: mcRaw.paybackP50,
      paybackP90: mcRaw.paybackP90,
      npvP10: mcRaw.npvP10 * n,
      npvP50: mcRaw.npvP50 * n,
      npvP90: mcRaw.npvP90 * n,
    },
    cashflow: fwd.points.map((p) => ({ month: p.month, cumulative: p.cumulative * n })),
  };
}

export interface PortfolioResult {
  marginDay: number;
  marginYear: number;
  capex: number;
  revenueDay: number;
  energyCostDay: number;
  minerCount: number;
  powerKW: number;
  hashratePH: number;
  paybackYears: number | null;
  npv: number; // sum of module NPVs
  forwardPaybackMonths: number | null; // from aggregate cash flow
  cashflow: CashPoint[];
  mcNpvP10: number;
  mcNpvP50: number;
  mcNpvP90: number;
}

export function computePortfolio(results: ModuleResult[]): PortfolioResult {
  const sum = (f: (r: ModuleResult) => number) => results.reduce((acc, r) => acc + f(r), 0);
  const marginDay = sum((r) => r.marginDay);
  const capex = sum((r) => r.capex);
  const horizon = results.reduce((m, r) => Math.max(m, r.cashflow.length), 0);
  const cashflow: CashPoint[] = Array.from({ length: horizon }, (_, i) => ({
    month: i + 1,
    cumulative: results.reduce((acc, r) => acc + (r.cashflow[i]?.cumulative ?? 0), 0),
  }));
  let forwardPaybackMonths: number | null = null;
  for (const p of cashflow) {
    if (p.cumulative >= 0) {
      forwardPaybackMonths = p.month;
      break;
    }
  }
  return {
    marginDay,
    marginYear: marginDay * 365,
    capex,
    revenueDay: sum((r) => r.revenueDay),
    energyCostDay: sum((r) => r.energyCostDay),
    minerCount: sum((r) => r.minerCount),
    powerKW: sum((r) => r.powerKW),
    hashratePH: sum((r) => r.hashratePH),
    paybackYears: marginDay > 0 ? capex / marginDay / 365 : null,
    npv: sum((r) => r.npv),
    forwardPaybackMonths,
    cashflow,
    mcNpvP10: sum((r) => r.mc.npvP10),
    mcNpvP50: sum((r) => r.mc.npvP50),
    mcNpvP90: sum((r) => r.mc.npvP90),
  };
}
