import {
  computeMinerEconomics,
  computeSiteEconomics,
  runMiningScenarioBand,
  DEFAULT_MINING_PARAMETERS,
  type MinerInputs,
  type SiteInputs,
} from '@/packages/calc-engine';

const MINER_KEYS: (keyof MinerInputs)[] = [
  'hashrateTH',
  'efficiencyJPerTH',
  'energyEurPerKwh',
  'uptime',
  'poolFee',
  'overhead',
  'omPerDay',
  'capex',
];

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function parseMiner(v: unknown): MinerInputs | null {
  if (!isRecord(v)) return null;
  for (const k of MINER_KEYS) {
    if (typeof v[k] !== 'number' || !Number.isFinite(v[k])) return null;
  }
  return v as unknown as MinerInputs;
}

function parseSite(v: unknown, miner: MinerInputs): SiteInputs | null {
  if (!isRecord(v)) return null;
  for (const k of ['capacityMW', 'capacityFactor', 'energySharePct'] as const) {
    if (typeof v[k] !== 'number' || !Number.isFinite(v[k])) return null;
  }
  return {
    capacityMW: v.capacityMW as number,
    capacityFactor: v.capacityFactor as number,
    energySharePct: v.energySharePct as number,
    miner,
  };
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid JSON body' }, { status: 400 });
  }
  if (!isRecord(body)) return Response.json({ error: 'body must be an object' }, { status: 400 });

  const miner = parseMiner(body.miner);
  if (!miner) return Response.json({ error: 'invalid miner inputs' }, { status: 400 });

  const params = DEFAULT_MINING_PARAMETERS;
  const result: Record<string, unknown> = {
    miner: computeMinerEconomics(miner, params.hashprice),
    band: runMiningScenarioBand(miner, params),
    asOf: params.asOf,
  };

  if (body.site !== undefined) {
    const site = parseSite(body.site, miner);
    if (!site) return Response.json({ error: 'invalid site inputs' }, { status: 400 });
    result.site = computeSiteEconomics(site, params.hashprice);
  }

  return Response.json(result, { status: 200 });
}
