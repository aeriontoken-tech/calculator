import { computeMinerEconomics, type MinerInputs } from '@/packages/calc-engine';

export interface MarginCurveProps {
  inputs: MinerInputs;
  hashprice: number;
  energyMin: number;
  energyMax: number;
  steps?: number;
  width?: number;
  height?: number;
}

export function MarginCurve({ inputs, hashprice, energyMin, energyMax, steps = 40, width = 520, height = 200 }: MarginCurveProps) {
  const pad = 24;
  const points: { e: number; m: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const e = energyMin + ((energyMax - energyMin) * i) / steps;
    points.push({ e, m: computeMinerEconomics({ ...inputs, energyEurPerKwh: e }, hashprice).marginDay });
  }
  const ms = points.map((p) => p.m);
  const minM = Math.min(...ms, 0);
  const maxM = Math.max(...ms, 0);
  const x = (e: number) => pad + ((e - energyMin) / (energyMax - energyMin || 1)) * (width - 2 * pad);
  const y = (m: number) => height - pad - ((m - minM) / (maxM - minM || 1)) * (height - 2 * pad);
  const poly = points.map((p) => `${x(p.e).toFixed(1)},${y(p.m).toFixed(1)}`).join(' ');
  const zeroY = y(0);

  return (
    <svg role="img" aria-label="Cash margin per day versus energy price" width={width} height={height}>
      <line x1={pad} y1={zeroY} x2={width - pad} y2={zeroY} stroke="var(--rule)" strokeWidth={1} />
      <polyline points={poly} fill="none" stroke="var(--mint)" strokeWidth={2} />
      <text x={pad} y={height - 4} fill="var(--muted-cream)" fontSize={10} fontFamily="var(--font-mono)">
        energy €/kWh →
      </text>
    </svg>
  );
}
