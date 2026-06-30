import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SliderNumber } from './SliderNumber';

describe('SliderNumber', () => {
  it('renders an accessible slider and a linked numeric input sharing the value', () => {
    render(<SliderNumber label="Energy price" value={0.06} min={0} max={0.2} step={0.005} unit="€/kWh" onChange={() => {}} />);
    const slider = screen.getByRole('slider', { name: /energy price/i });
    expect(slider).toHaveValue('0.06');
    const number = screen.getByRole('spinbutton', { name: /energy price/i });
    expect(number).toHaveValue(0.06);
  });

  it('calls onChange when the numeric input changes', () => {
    const onChange = vi.fn();
    render(<SliderNumber label="Uptime" value={0.85} min={0} max={1} step={0.01} onChange={onChange} />);
    fireEvent.change(screen.getByRole('spinbutton', { name: /uptime/i }), { target: { value: '0.9' } });
    expect(onChange).toHaveBeenCalledWith(0.9);
  });
});
