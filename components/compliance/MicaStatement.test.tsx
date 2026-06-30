import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MicaStatement } from './MicaStatement';
import { RiskBanner } from './RiskBanner';

describe('compliance components', () => {
  it('renders the MiCA Article 7 statement verbatim', () => {
    render(<MicaStatement />);
    expect(
      screen.getByText(/has not been reviewed or approved by any competent authority/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/solely responsible for the content/i)).toBeInTheDocument();
  });

  it('renders a non-dismissible risk banner mentioning illustrative scenarios', () => {
    render(<RiskBanner />);
    expect(screen.getByText(/illustrative/i)).toBeInTheDocument();
    expect(screen.queryByRole('button')).toBeNull();
  });
});
