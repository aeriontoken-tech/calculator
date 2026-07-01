import { computeForwardEconomics, type ForwardAssumptions } from './forward';
import type { MinerInputs } from './types';

function mulberry32(seed: number) {
  let s = seed;
  return function () {
    s |= 0; s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function normal(rng: () => number): number {
  const u = Math.max(1e-9, rng());
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
export interface McParams { paths: number; hashpriceSd: number; changeSd: number; energySd: number; uptimeSd: number; }
export const DEFAULT_MC: McParams = { paths: 400, hashpriceSd: 0.18, changeSd: 0.015, energySd: 0.15, uptimeSd: 0.06 };
export interface McResult {
  paybackP10: number | null; paybackP50: number | null; paybackP90: number | null;
  npvP10: number; npvP50: number; npvP90: number;
}
function pctile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const i = Math.min(sorted.length - 1, Math.max(0, Math.round((p / 100) * (sorted.length - 1))));
  return sorted[i];
}
export function runMonteCarlo(
  inputs: MinerInputs, hashprice0: number, a: ForwardAssumptions,
  mc: McParams = DEFAULT_MC, seed = 12345,
): McResult {
  const rng = mulberry32(seed);
  const paybacks: number[] = []; const npvs: number[] = [];
  for (let i = 0; i < mc.paths; i++) {
    const hp = hashprice0 * Math.exp(normal(rng) * mc.hashpriceSd);
    const change = a.hashpriceMonthlyChangePct + normal(rng) * mc.changeSd;
    const energy = Math.max(0.005, inputs.energyEurPerKwh * (1 + normal(rng) * mc.energySd));
    const uptime = Math.min(1, Math.max(0.2, inputs.uptime + normal(rng) * mc.uptimeSd));
    const r = computeForwardEconomics({ ...inputs, energyEurPerKwh: energy, uptime }, hp, { ...a, hashpriceMonthlyChangePct: change });
    paybacks.push(r.paybackMonths ?? a.horizonMonths + 1);
    npvs.push(r.npv);
  }
  paybacks.sort((x, y) => x - y);
  npvs.sort((x, y) => x - y);
  const cap = (v: number): number | null => (v > a.horizonMonths ? null : v);
  return {
    paybackP10: cap(pctile(paybacks, 10)), paybackP50: cap(pctile(paybacks, 50)), paybackP90: cap(pctile(paybacks, 90)),
    npvP10: pctile(npvs, 10), npvP50: pctile(npvs, 50), npvP90: pctile(npvs, 90),
  };
}
