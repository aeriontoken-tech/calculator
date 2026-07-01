// Single source of truth for which numbers are confirmed vs illustrative.
// Every unconfirmed value in the UI carries a <Src> badge pointing here, so
// nothing reads as a confirmed fact. Replace `status` as real figures land.

export type InputStatus = 'confirmed' | 'illustrative';
export interface InputMeta {
  status: InputStatus;
  source: string;
}

export const INPUTS: Record<string, InputMeta> = {
  saleRounds: {
    status: 'confirmed',
    source: 'Whitepaper sale rounds & vesting (summary.json saleRounds).',
  },
  minerModel: {
    status: 'confirmed',
    source: 'Documented reference miner: 234 TH/s @ 15 J/TH (summary.json miningInputs).',
  },
  hashprice: {
    status: 'illustrative',
    source: 'Base hashprice €36.63/PH·day from summary.json (as of 2026-05-29). Refresh to a live Luxor value before launch.',
  },
  decline: {
    status: 'illustrative',
    source: 'Assumed ≈ −1.5%/month hashprice erosion from difficulty growth (default). Placeholder — calibrate to a difficulty forecast.',
  },
  discount: {
    status: 'illustrative',
    source: 'Assumed 12%/yr discount rate for NPV. Set to your actual cost of capital.',
  },
  minerCapex: {
    status: 'illustrative',
    source: '€2,000/unit placeholder (S21-class). Confirm with a real hardware quote.',
  },
  energyPrice: {
    status: 'illustrative',
    source: 'Per-site delivered energy cost — pending confirmed site contracts.',
  },
  siteParams: {
    status: 'illustrative',
    source: 'Preset site energy / uptime / fleet size are illustrative — pending confirmed site data.',
  },
  boostConstants: {
    status: 'illustrative',
    source: 'Mining-Boost formula is from the whitepaper; the constants (S0, exponents) are illustrative — pending calibration & legal review.',
  },
  tiers: {
    status: 'illustrative',
    source: 'License-tier ARN thresholds are illustrative — pending the node product decision & legal review.',
  },
  arnPriceScenario: {
    status: 'illustrative',
    source: 'A hypothetical ARN price you enter — never a forecast or a value projected by Aerion.',
  },
};
