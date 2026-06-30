import type { MinerInputs, MinerResult, SiteInputs, SiteResult } from './types';

export function computeMinerEconomics(inputs: MinerInputs, hashprice: number): MinerResult {
  const { hashrateTH, efficiencyJPerTH, energyEurPerKwh, uptime, poolFee, overhead, omPerDay, capex } = inputs;

  const powerKW = (hashrateTH * efficiencyJPerTH) / 1000;
  const energyDayKwh = powerKW * 24 * uptime * (1 + overhead);
  const energyCostDay = energyDayKwh * energyEurPerKwh;
  const revenueDay = (hashrateTH / 1000) * hashprice * uptime * (1 - poolFee);
  const marginDay = revenueDay - energyCostDay - omPerDay;
  const breakevenEnergyEurPerKwh = hashprice / (24 * efficiencyJPerTH);
  const paybackYears = marginDay > 0 ? capex / marginDay / 365 : null;

  return {
    powerKW,
    energyDayKwh,
    energyCostDay,
    revenueDay,
    marginDay,
    breakevenEnergyEurPerKwh,
    paybackYears,
  };
}

export function computeSiteEconomics(inputs: SiteInputs, hashprice: number): SiteResult {
  const { capacityMW, capacityFactor, energySharePct, miner } = inputs;
  const { hashrateTH, efficiencyJPerTH, overhead, poolFee, omPerDay, capex, energyEurPerKwh } = miner;

  const annualGenMwh = capacityMW * 8760 * capacityFactor;
  const aerionShareMwh = annualGenMwh * energySharePct;
  const avgKW = (aerionShareMwh * 1000) / 8760;

  const powerKW = (hashrateTH * efficiencyJPerTH) / 1000;
  // Miners sized to allocated average power, net of cooling/overhead draw.
  const supportedMiners = avgKW / (powerKW * (1 + overhead));

  const revenuePerMinerYear = (hashrateTH / 1000) * hashprice * (1 - poolFee) * 365;
  const revenueYear = supportedMiners * revenuePerMinerYear;
  const energyCostYear = aerionShareMwh * 1000 * energyEurPerKwh;
  const omYear = supportedMiners * omPerDay * 365;
  const totalCapex = supportedMiners * capex;
  const marginYear = revenueYear - energyCostYear - omYear;
  const paybackYears = marginYear > 0 ? totalCapex / marginYear : null;

  return {
    annualGenMwh,
    aerionShareMwh,
    avgKW,
    supportedMiners,
    revenueYear,
    energyCostYear,
    omYear,
    marginYear,
    totalCapex,
    paybackYears,
  };
}
