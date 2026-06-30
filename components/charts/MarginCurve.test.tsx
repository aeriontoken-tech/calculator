import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarginCurve } from './MarginCurve';
import type { MinerInputs } from '@/packages/calc-engine';

const inputs: MinerInputs = {
  hashrateTH: 234, efficiencyJPerTH: 15, energyEurPerKwh: 0.06, uptime: 0.85,
  poolFee: 0.02, overhead: 0.08, omPerDay: 1.2, capex: 2000,
};

describe('MarginCurve', () => {
  it('renders an SVG polyline with an accessible label', () => {
    const { container } = render(<MarginCurve inputs={inputs} hashprice={36.63} energyMin={0} energyMax={0.12} />);
    expect(screen.getByRole('img', { name: /margin/i })).toBeInTheDocument();
    expect(container.querySelector('polyline')).not.toBeNull();
  });

  it('uses the mint accent for the single data series', () => {
    const { container } = render(<MarginCurve inputs={inputs} hashprice={36.63} energyMin={0} energyMax={0.12} />);
    expect(container.querySelector('polyline')?.getAttribute('stroke')).toBe('var(--mint)');
  });
});
