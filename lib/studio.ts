import {
  computeMinerEconomics,
  runMiningScenarioBand,
  type MinerInputs,
  type MinerResult,
  type MiningParameters,
  type ScenarioBand,
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
  paybackYears: number | null;
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

export function computeModule(cfg: ModuleConfig, params: MiningParameters): ModuleResult {
  const inputs = moduleToMinerInputs(cfg, params);
  const perMiner = computeMinerEconomics(inputs, params.hashprice);
  const band = runMiningScenarioBand(inputs, params);
  const n = Math.max(0, cfg.minerCount);
  const marginDay = perMiner.marginDay * n;
  const capex = params.defaults.capex * n;
  return {
    perMiner,
    band,
    minerCount: n,
    revenueDay: perMiner.revenueDay * n,
    energyCostDay: perMiner.energyCostDay * n,
    marginDay,
    capex,
    powerKW: perMiner.powerKW * n,
    hashratePH: (cfg.hashrateTH / 1000) * n,
    paybackYears: marginDay > 0 ? capex / marginDay / 365 : null,
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
}

export function computePortfolio(results: ModuleResult[]): PortfolioResult {
  const sum = (f: (r: ModuleResult) => number) => results.reduce((a, r) => a + f(r), 0);
  const marginDay = sum((r) => r.marginDay);
  const capex = sum((r) => r.capex);
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
  };
}
