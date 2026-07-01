export interface MarketParameters {
  hashprice: number; // EUR per PH/day
  btcPriceEur: number;
  difficultyProxy: number; // 1.0 baseline
  monthlyChangePct: number; // hashprice monthly change (decline), e.g. -0.03
  asOf: string;
  source: string;
}
export const DEFAULT_MARKET: MarketParameters = {
  hashprice: 36.63,
  btcPriceEur: 60000,
  difficultyProxy: 1.0,
  monthlyChangePct: -0.03,
  asOf: '2026-05-29',
  source: 'aerion-tokenomics-simulation/summary.json (hashprice); decline illustrative',
};
