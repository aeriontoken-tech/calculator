import { DEFAULT_MINING_PARAMETERS } from '@/packages/calc-engine';

// Curated, dated market inputs. Overridable via environment variables (set in
// the hosting dashboard) so ops can update them without touching code. The
// /admin page edits these and generates the exact env block to paste.

export interface StudioMarket {
  hashprice: number;
  asOf: string;
  source: string;
  declinePctMonthly: number;
  discountAnnualPct: number;
}

export const ENV_KEYS: Record<keyof StudioMarket, string> = {
  hashprice: 'NEXT_PUBLIC_HASHPRICE',
  asOf: 'NEXT_PUBLIC_MARKET_ASOF',
  source: 'NEXT_PUBLIC_MARKET_SOURCE',
  declinePctMonthly: 'NEXT_PUBLIC_DECLINE_PCT',
  discountAnnualPct: 'NEXT_PUBLIC_DISCOUNT_PCT',
};

export const MARKET_DEFAULTS: StudioMarket = {
  hashprice: DEFAULT_MINING_PARAMETERS.hashprice,
  asOf: DEFAULT_MINING_PARAMETERS.asOf,
  source: DEFAULT_MINING_PARAMETERS.source,
  declinePctMonthly: -0.01,
  discountAnnualPct: 0.12,
};

function num(v: string | undefined, d: number): number {
  if (v == null || v.trim() === '') return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

export function getStudioMarket(): StudioMarket {
  return {
    hashprice: num(process.env.NEXT_PUBLIC_HASHPRICE, MARKET_DEFAULTS.hashprice),
    asOf: process.env.NEXT_PUBLIC_MARKET_ASOF || MARKET_DEFAULTS.asOf,
    source: process.env.NEXT_PUBLIC_MARKET_SOURCE || MARKET_DEFAULTS.source,
    declinePctMonthly: num(process.env.NEXT_PUBLIC_DECLINE_PCT, MARKET_DEFAULTS.declinePctMonthly),
    discountAnnualPct: num(process.env.NEXT_PUBLIC_DISCOUNT_PCT, MARKET_DEFAULTS.discountAnnualPct),
  };
}
