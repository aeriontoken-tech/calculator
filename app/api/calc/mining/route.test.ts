import { describe, it, expect } from 'vitest';
import { POST } from './route';

function req(body: unknown): Request {
  return new Request('http://localhost/api/calc/mining', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const miner = {
  hashrateTH: 234,
  efficiencyJPerTH: 15,
  energyEurPerKwh: 0.06,
  uptime: 0.85,
  poolFee: 0.02,
  overhead: 0.08,
  omPerDay: 1.2,
  capex: 2000,
};

describe('POST /api/calc/mining', () => {
  it('returns miner result + scenario band for valid input', async () => {
    const res = await POST(req({ miner }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.miner.marginDay).toBeCloseTo(1.3, 1);
    expect(json.band.optimistic.marginDay).toBeGreaterThan(json.band.base.marginDay);
    expect(json.asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('includes site result when site provided', async () => {
    const res = await POST(
      req({ miner, site: { capacityMW: 5, capacityFactor: 0.25, energySharePct: 0.1, miner } }),
    );
    const json = await res.json();
    expect(json.site.marginYear).toBeCloseTo(20957, -2);
  });

  it('rejects a non-object body with 400', async () => {
    const res = await POST(req(42));
    expect(res.status).toBe(400);
  });

  it('rejects missing miner fields with 400', async () => {
    const res = await POST(req({ miner: { hashrateTH: 234 } }));
    expect(res.status).toBe(400);
  });
});
