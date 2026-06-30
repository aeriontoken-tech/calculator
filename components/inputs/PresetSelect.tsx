'use client';

import { useId } from 'react';

export interface PresetOption<T> {
  label: string;
  value: T;
}

export interface PresetSelectProps<T extends string | number> {
  label: string;
  value: T;
  options: PresetOption<T>[];
  onChange: (value: T) => void;
}

export function PresetSelect<T extends string | number>({ label, value, options, onChange }: PresetSelectProps<T>) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id} className="section-label" style={{ color: 'var(--muted-cream)' }}>
        {label}
      </label>
      <select
        id={id}
        value={String(value)}
        onChange={(e) => {
          const found = options.find((o) => String(o.value) === e.target.value);
          if (found) onChange(found.value);
        }}
        style={{
          background: 'transparent',
          color: 'var(--cream)',
          border: '1px solid var(--rule)',
          padding: '6px 8px',
          fontFamily: 'var(--font-mono)',
        }}
      >
        {options.map((o) => (
          <option key={String(o.value)} value={String(o.value)} style={{ color: 'var(--obsidian)' }}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
