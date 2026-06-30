import type { MinerInputs, MinerResult } from './types';

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
