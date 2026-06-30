import { describe, it, expect } from 'vitest';
import { formatEur, formatEur2, formatArn, formatYears, formatPct } from './format';

describe('format helpers', () => {
  it('formats euros with no decimals and a thousands separator', () => {
    expect(formatEur(20957)).toBe('€20,957');
  });
  it('formats euros with two decimals', () => {
    expect(formatEur2(1.3)).toBe('€1.30');
  });
  it('formats ARN token counts', () => {
    expect(formatArn(10300)).toBe('10,300 ARN');
  });
  it('formats payback years, em-dash for null', () => {
    expect(formatYears(2.0141)).toBe('2.01 yr');
    expect(formatYears(null)).toBe('—');
  });
  it('formats a fraction as a percent', () => {
    expect(formatPct(0.85)).toBe('85%');
  });
});
