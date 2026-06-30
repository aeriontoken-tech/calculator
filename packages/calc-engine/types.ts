export interface MinerInputs {
  hashrateTH: number;
  efficiencyJPerTH: number;
  energyEurPerKwh: number;
  uptime: number; // 0..1
  poolFee: number; // 0..1
  overhead: number; // 0..1
  omPerDay: number; // EUR
  capex: number; // EUR
}

export interface MinerResult {
  powerKW: number;
  energyDayKwh: number;
  energyCostDay: number;
  revenueDay: number;
  marginDay: number;
  breakevenEnergyEurPerKwh: number;
  paybackYears: number | null; // null when marginDay <= 0
}

export interface SiteInputs {
  capacityMW: number;
  capacityFactor: number; // 0..1
  energySharePct: number; // 0..1 (Aerion's share of generated energy)
  miner: MinerInputs;
}

export interface SiteResult {
  annualGenMwh: number;
  aerionShareMwh: number;
  avgKW: number;
  supportedMiners: number; // fractional, energy-limited continuous operation
  revenueYear: number;
  energyCostYear: number;
  omYear: number;
  marginYear: number;
  totalCapex: number;
  paybackYears: number | null;
}

export interface PaybackPercentiles {
  p10: number;
  p50: number;
  p90: number;
}

export interface ScenarioBand {
  conservative: MinerResult;
  base: MinerResult;
  optimistic: MinerResult;
  paybackPercentiles: PaybackPercentiles;
}

export interface MiningDefaults {
  hashrateTH: number;
  efficiencyJPerTH: number;
  overhead: number;
  poolFee: number;
  omPerDay: number;
  capex: number;
}

export interface MiningParameters {
  hashprice: number; // EUR per PH/day
  asOf: string; // ISO date (YYYY-MM-DD)
  source: string;
  defaults: MiningDefaults;
  paybackPercentiles: PaybackPercentiles;
}
