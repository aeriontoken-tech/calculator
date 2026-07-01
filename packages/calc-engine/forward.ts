import type { MinerInputs } from './types';

export interface ForwardAssumptions {
  horizonMonths: number;
  hashpriceMonthlyChangePct: number; // e.g. -0.03
  discountAnnualPct: number; // e.g. 0.12
  daysPerMonth?: number; // default 30.4368
}
export interface ForwardPoint { month: number; hashprice: number; marginDay: number; cumulative: number; }
export interface ForwardResult {
  points: ForwardPoint[];
  paybackMonths: number | null; // first month cumulative >= 0; null if never within horizon
  npv: number;
  totalProfit: number; // cumulative at horizon (net of capex)
  roiPct: number; // totalProfit / capex
}

export function computeForwardEconomics(inputs: MinerInputs, hashprice0: number, a: ForwardAssumptions): ForwardResult {
  const days = a.daysPerMonth ?? 30.4368;
  const powerKW = (inputs.hashrateTH * inputs.efficiencyJPerTH) / 1000;
  const energyCostDay = powerKW * 24 * inputs.uptime * (1 + inputs.overhead) * inputs.energyEurPerKwh;
  const rMonthly = Math.pow(1 + a.discountAnnualPct, 1 / 12) - 1;
  let cumulative = -inputs.capex;
  let npv = -inputs.capex;
  let paybackMonths: number | null = null;
  const points: ForwardPoint[] = [];
  for (let m = 0; m < a.horizonMonths; m++) {
    const hp = hashprice0 * Math.pow(1 + a.hashpriceMonthlyChangePct, m);
    const revenueDay = (inputs.hashrateTH / 1000) * hp * inputs.uptime * (1 - inputs.poolFee);
    const marginDay = revenueDay - energyCostDay - inputs.omPerDay;
    // A rational operator — and Aerion's AI Operator specifically — idles the
    // miner when the daily spread turns negative, rather than mining at a loss.
    // Idle months therefore contribute nothing (they never subtract).
    const monthMargin = Math.max(0, marginDay) * days;
    cumulative += monthMargin;
    npv += monthMargin / Math.pow(1 + rMonthly, m + 1);
    if (paybackMonths === null && cumulative >= 0) paybackMonths = m + 1;
    points.push({ month: m + 1, hashprice: hp, marginDay, cumulative });
  }
  return { points, paybackMonths, npv, totalProfit: cumulative, roiPct: cumulative / inputs.capex };
}
