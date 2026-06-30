import { DEFAULT_MINING_PARAMETERS } from '@/packages/calc-engine';

export async function GET(): Promise<Response> {
  return Response.json({ mining: DEFAULT_MINING_PARAMETERS }, { status: 200 });
}
