import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MiningModule } from './MiningModule';
import { DEFAULT_MINING_PARAMETERS } from '@/packages/calc-engine';

describe('MiningModule', () => {
  it('shows the documented base margin and payback on first render', () => {
    render(<MiningModule parameters={DEFAULT_MINING_PARAMETERS} />);
    expect(screen.getByTestId('margin-day')).toHaveTextContent('€1.30');
    expect(screen.getByTestId('payback')).toHaveTextContent('4.21 yr');
  });

  it('recomputes when energy price changes to a cheaper surplus rate', () => {
    render(<MiningModule parameters={DEFAULT_MINING_PARAMETERS} />);
    const energy = screen.getByRole('spinbutton', { name: /energy price/i });
    fireEvent.change(energy, { target: { value: '0.04' } });
    // margin improves above €1.30
    const margin = Number(screen.getByTestId('margin-day').textContent!.replace(/[^\d.-]/g, ''));
    expect(margin).toBeGreaterThan(1.3);
  });

  it('renders the illustrative disclaimer and the as-of stamp', () => {
    render(<MiningModule parameters={DEFAULT_MINING_PARAMETERS} />);
    expect(screen.getByText(/illustrative scenarios/i)).toBeInTheDocument();
    expect(screen.getByText(/market data as of 2026-05-29/i)).toBeInTheDocument();
  });
});
