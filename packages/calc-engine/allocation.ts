// ARN investment allocation + vesting. Sale-round figures from
// outputs/aerion-tokenomics-simulation/summary.json (saleRounds) and
// aerion-marketing-math.md (dashboard bonus). All outputs are illustrative.

export interface SaleRound {
  key: 'seed' | 'private' | 'public';
  label: string;
  priceEur: number;
  cliffMonths: number; // months until the first unlock
  cliffUnlock: number; // fraction unlocked at the cliff
  linearMonths: number; // months of linear vesting after the cliff
}

export const SALE_ROUNDS: SaleRound[] = [
  { key: 'seed', label: 'Seed', priceEur: 0.02, cliffMonths: 12, cliffUnlock: 0.3, linearMonths: 24 },
  { key: 'private', label: 'Private', priceEur: 0.05, cliffMonths: 6, cliffUnlock: 0.25, linearMonths: 18 },
  { key: 'public', label: 'Public', priceEur: 0.1, cliffMonths: 9, cliffUnlock: 0.2, linearMonths: 12 },
];

// Scarcity context (illustrative, sourced from the tokenomics simulation).
export const SUPPLY_FACTS = {
  maxSupply: 1_000_000_000,
  pompReserve: 350_000_000,
  pompLockedP50Pct: 0.97,
  absorptionCoverageM48P50: 8.15,
  defaultDashboardBonusPct: 0.03,
};

export interface AllocationInputs {
  amountEur: number;
  round: SaleRound;
  dashboardBonusPct: number; // 0 when acquiring on an exchange
  hypotheticalPriceEur?: number | null; // user-supplied "what if ARN were €X"; never app-projected
}

export interface AllocationResult {
  arnGross: number;
  arnReceived: number;
  bonusArn: number;
  costBasisEur: number; // effective €/ARN
  hypotheticalValueEur: number | null;
}

export function computeAllocation(inputs: AllocationInputs): AllocationResult {
  const arnGross = inputs.round.priceEur > 0 ? inputs.amountEur / inputs.round.priceEur : 0;
  const arnReceived = arnGross * (1 + inputs.dashboardBonusPct);
  const bonusArn = arnReceived - arnGross;
  const costBasisEur = arnReceived > 0 ? inputs.amountEur / arnReceived : 0;
  const hypotheticalValueEur =
    inputs.hypotheticalPriceEur != null ? arnReceived * inputs.hypotheticalPriceEur : null;
  return { arnGross, arnReceived, bonusArn, costBasisEur, hypotheticalValueEur };
}

export interface VestingPoint {
  month: number;
  unlockedFraction: number;
  unlockedArn: number;
}

export function computeVesting(round: SaleRound, arnReceived: number, months = 36): VestingPoint[] {
  const pts: VestingPoint[] = [];
  for (let m = 0; m <= months; m++) {
    let f: number;
    if (m < round.cliffMonths) {
      f = 0;
    } else {
      const t = m - round.cliffMonths;
      const linear = round.linearMonths > 0 ? Math.min(1, t / round.linearMonths) : 1;
      f = round.cliffUnlock + (1 - round.cliffUnlock) * linear;
    }
    f = Math.min(1, Math.max(0, f));
    pts.push({ month: m, unlockedFraction: f, unlockedArn: arnReceived * f });
  }
  return pts;
}
