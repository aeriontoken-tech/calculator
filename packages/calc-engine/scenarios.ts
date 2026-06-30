import type { MinerInputs, MiningParameters, ScenarioBand } from './types';
import { computeMinerEconomics } from './mining';

export function runMiningScenarioBand(inputs: MinerInputs, params: MiningParameters): ScenarioBand {
  const conservativeInputs: MinerInputs = {
    ...inputs,
    uptime: inputs.uptime * 0.9,
    energyEurPerKwh: inputs.energyEurPerKwh * 1.25,
  };
  const optimisticInputs: MinerInputs = {
    ...inputs,
    uptime: Math.min(1, inputs.uptime * 1.06),
    energyEurPerKwh: inputs.energyEurPerKwh * 0.85,
  };

  return {
    conservative: computeMinerEconomics(conservativeInputs, params.hashprice * 0.85),
    base: computeMinerEconomics(inputs, params.hashprice),
    optimistic: computeMinerEconomics(optimisticInputs, params.hashprice * 1.2),
    paybackPercentiles: params.paybackPercentiles,
  };
}
