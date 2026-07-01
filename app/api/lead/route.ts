// Investor "Request access" lead capture. Validates, honeypots, rate-limits,
// then forwards to a configured destination. Fails closed in production if no
// destination is configured (so leads are never silently dropped).

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;
const hits = new Map<string, { n: number; exp: number }>();

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
function clean(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().replace(/\s+/g, ' ').slice(0, max) : '';
}
function requiresForwarding(env = process.env): boolean {
  if (env.ALLOW_UNFORWARDED_LEADS === 'true') return false;
  return env.VERCEL === '1' || env.VERCEL_ENV === 'production' || env.NODE_ENV === 'production';
}
function clientIp(req: Request): string | undefined {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip')?.trim() || undefined;
}
function rateLimited(key: string, now = Date.now()): boolean {
  for (const [k, e] of hits) if (e.exp <= now) hits.delete(k);
  const cur = hits.get(key);
  if ((cur?.n ?? 0) >= RATE_MAX) return true;
  hits.set(key, { n: (cur?.n ?? 0) + 1, exp: cur?.exp ?? now + RATE_WINDOW_MS });
  return false;
}

async function forward(lead: Record<string, string>, env = process.env, fetchImpl = globalThis.fetch): Promise<'sent' | 'skipped'> {
  const webhook = env.INVESTOR_LEAD_WEBHOOK_URL?.trim();
  const discord = env.DISCORD_WEBHOOK_URL?.trim();
  const tasks: Promise<Response>[] = [];
  if (webhook) tasks.push(fetchImpl(webhook, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ type: 'aerion_calculator_lead', lead, at: new Date().toISOString() }) }));
  if (discord) tasks.push(fetchImpl(discord, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ content: `Aerion access request from ${lead.name} (${lead.email})`, allowed_mentions: { parse: [] } }) }));
  if (tasks.length === 0) return 'skipped';
  const res = await Promise.all(tasks);
  if (res.every((r) => !r.ok)) throw new Error('all channels failed');
  return 'sent';
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, errors: ['invalid JSON'] }, { status: 400 });
  }
  if (!isRecord(body)) return Response.json({ ok: false, errors: ['body must be an object'] }, { status: 400 });
  if (clean(body.company, 100).length > 0) return Response.json({ ok: false, errors: ['rejected'] }, { status: 400 }); // honeypot

  const name = clean(body.name, 120);
  const email = clean(body.email, 254).toLowerCase();
  const message = clean(body.message, 1000);
  const errors: string[] = [];
  if (!name) errors.push('name is required');
  if (!email || !EMAIL.test(email)) errors.push('a valid email is required');
  if (errors.length) return Response.json({ ok: false, errors }, { status: 400 });

  const ip = clientIp(request);
  if (rateLimited(ip ? `ip:${ip}` : `email:${email}`)) return Response.json({ ok: false, errors: ['too many submissions'] }, { status: 429 });

  try {
    const status = await forward({ name, email, message });
    if (status === 'skipped' && requiresForwarding()) return Response.json({ ok: false, errors: ['lead forwarding not configured'] }, { status: 503 });
  } catch {
    return Response.json({ ok: false, errors: ['delivery failed'] }, { status: 502 });
  }
  return Response.json({ ok: true }, { status: 200 });
}

export function resetLeadRateLimit(): void {
  hits.clear();
}
