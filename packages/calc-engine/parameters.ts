import type { MiningParameters } from './types';

// Source: outputs/aerion-tokenomics-simulation/summary.json
//   miningInputs + results.minerPaybackYears*
export const DEFAULT_MINING_PARAMETERS: MiningParameters = {
  hashprice: 36.63,
  asOf: '2026-05-29',
  source: 'aerion-tokenomics-simulation/summary.json (miningInputs.baseHashprice)',
  defaults: {
    hashrateTH: 234,
    efficiencyJPerTH: 15,
    overhead: 0.08,
    poolFee: 0.02,
    omPerDay: 1.2,
    capex: 2000,
  },
  paybackPercentiles: {
    p10: 1.6667595465556175,
    p50: 2.0141281125069774,
    p90: 2.487872337442991,
  },
};
