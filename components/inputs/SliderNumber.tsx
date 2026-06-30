'use client';

import { useId } from 'react';

export interface SliderNumberProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
}

export function SliderNumber({ label, value, min, max, step, unit, onChange }: SliderNumberProps) {
  const id = useId();
  const emit = (raw: string) => {
    if (raw.trim() === '') return;
    const n = Number(raw);
    if (Number.isFinite(n)) onChange(n);
  };
  return (
    <div className="field">
      <label htmlFor={`${id}-num`} className="section-label" style={{ color: 'var(--muted-cream)' }}>
        {label}
        {unit ? <span className="meta">· {unit}</span> : null}
      </label>
      <div style={{ display: 'flex', gap: 'var(--space)', alignItems: 'center' }}>
        <input
          type="range"
          aria-label={label}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => emit(e.target.value)}
          style={{ flex: 1, accentColor: 'var(--mint)' }}
        />
        <input
          id={`${id}-num`}
          type="number"
          inputMode="numeric"
          aria-label={label}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => emit(e.target.value)}
          style={{
            width: 90,
            background: 'transparent',
            color: 'var(--cream)',
            border: '1px solid var(--rule)',
            padding: '4px 8px',
            fontFamily: 'var(--font-mono)',
          }}
        />
      </div>
    </div>
  );
}
