import { DEFAULT_MINING_PARAMETERS } from '@/packages/calc-engine';
import { MicaStatement } from '@/components/compliance/MicaStatement';
import { AsOfStamp } from '@/components/compliance/AsOfStamp';

export default function MethodologyPage() {
  const p = DEFAULT_MINING_PARAMETERS;
  return (
    <main className="page">
      <p className="section-label">Methodology &amp; assumptions</p>
      <h1 style={{ fontSize: 40, margin: '12px 0 24px' }}>
        Every number, traceable<span className="dot">.</span>
      </h1>

      <h2 style={{ fontSize: 22 }}>Per-miner economics</h2>
      <pre className="meta" style={{ whiteSpace: 'pre-wrap' }}>{`powerKW        = hashrateTH * efficiencyJPerTH / 1000
energyDayKwh   = powerKW * 24 * uptime * (1 + overhead)
revenueDay     = (hashrateTH/1000) * hashprice * uptime * (1 - poolFee)
marginDay      = revenueDay - energyDayKwh*energyPrice - omPerDay
breakevenEnergy= hashprice / (24 * efficiencyJPerTH)
paybackYears   = capex / marginDay / 365   (— if marginDay <= 0)`}</pre>

      <h2 style={{ fontSize: 22 }}>Per-site economics (energy-limited)</h2>
      <pre className="meta" style={{ whiteSpace: 'pre-wrap' }}>{`annualGenMwh   = capacityMW * 8760 * capacityFactor
aerionShareMwh = annualGenMwh * energySharePct
avgKW          = aerionShareMwh * 1000 / 8760
supportedMiners= avgKW / (powerKW * (1 + overhead))
marginYear     = revenueYear - energyCostYear - omYear
paybackYears   = totalCapex / marginYear`}</pre>

      <h2 style={{ fontSize: 22 }}>Default parameters</h2>
      <ul className="meta">
        <li>Hashprice: €{p.hashprice}/PH/day</li>
        <li>Miner: {p.defaults.hashrateTH} TH/s @ {p.defaults.efficiencyJPerTH} J/TH</li>
        <li>Overhead {Math.round(p.defaults.overhead * 100)}% · pool fee {Math.round(p.defaults.poolFee * 100)}% · O&amp;M €{p.defaults.omPerDay}/day · capex €{p.defaults.capex}</li>
        <li>Monte-Carlo miner payback: P10 {p.paybackPercentiles.p10.toFixed(2)} · P50 {p.paybackPercentiles.p50.toFixed(2)} · P90 {p.paybackPercentiles.p90.toFixed(2)} yr</li>
      </ul>
      <AsOfStamp asOf={p.asOf} source={p.source} />
      <hr className="rule" />
      <MicaStatement />
    </main>
  );
}
