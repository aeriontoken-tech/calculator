// Mining-Boost = ACCESS PRIORITY, not yield. Concave in stake so large
// holders do not dominate linearly. Source: aerion-sixth-pass-token-node-economics.md.

export interface BoostParams {
  b0: number;
  b1: number;
  s0: number; // reference stake
  a: number; // uptime exponent
  b: number; // reputation exponent
  c: number; // task-quality exponent
}

export const DEFAULT_BOOST: BoostParams = { b0: 1, b1: 1.4, s0: 10000, a: 0.5, b: 0.5, c: 0.5 };

export interface BoostInputs {
  stake: number;
  uptime: number; // 0..1
  reputation: number; // 0..1
  taskQuality: number; // 0..1
  eligible: boolean;
  risk?: number; // 0..1
}

export function computeBoost(i: BoostInputs, p: BoostParams = DEFAULT_BOOST): number {
  if (!i.eligible) return 0;
  const stakeTerm = p.b0 + p.b1 * Math.log(1 + Math.max(0, i.stake) / p.s0);
  return (
    stakeTerm *
    Math.pow(Math.max(0, i.uptime), p.a) *
    Math.pow(Math.max(0, i.reputation), p.b) *
    Math.pow(Math.max(0, i.taskQuality), p.c) *
    (i.risk ?? 1)
  );
}

// User's share of dashboard allocation relative to an illustrative pool of
// average participants. Access priority — never a share of proceeds.
export function accessShare(userBoost: number, competitorBoost: number, poolN: number): number {
  const total = userBoost + Math.max(0, poolN - 1) * competitorBoost;
  return total > 0 ? userBoost / total : 0;
}

export interface LicenseClass {
  key: string;
  name: string;
  minStake: number;
  grants: string;
}

export const LICENSE_CLASSES: LicenseClass[] = [
  { key: 'access', name: 'Founding Access Pass', minStake: 0, grants: 'Dashboard tier · allocation windows · service-credit priority' },
  { key: 'capacity', name: 'Capacity Priority Seat', minStake: 5000, grants: 'Compute/analytics queue priority · fee discounts' },
  { key: 'verifier', name: 'Verifier Seat', minStake: 25000, grants: 'Verifier task eligibility · reputation · access priority' },
  { key: 'partner', name: 'Site Partner Node', minStake: 100000, grants: 'Operator dashboard · settlement reports · site analytics' },
];

export function licenseForStake(stake: number): LicenseClass {
  let cls = LICENSE_CLASSES[0];
  for (const c of LICENSE_CLASSES) if (stake >= c.minStake) cls = c;
  return cls;
}
