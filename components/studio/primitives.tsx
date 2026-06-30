'use client';

import { useEffect, useId } from 'react';
import { motion, useSpring, useTransform } from 'motion/react';

/* Animated number that springs to its target and formats live. */
export function CountUp({
  value,
  format,
  className,
  style,
}: {
  value: number;
  format: (n: number) => string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const spring = useSpring(value, { stiffness: 80, damping: 18, mass: 0.7 });
  useEffect(() => {
    spring.set(value);
  }, [value, spring]);
  const text = useTransform(spring, (v) => format(v));
  return (
    <motion.span className={className} style={style}>
      {text}
    </motion.span>
  );
}

/* Slider with a linked numeric chip and a sage→mint fill. */
export function RangeField({
  label,
  unit,
  value,
  min,
  max,
  step,
  onChange,
  display,
}: {
  label: string;
  unit?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
  display?: (n: number) => string;
}) {
  const fill = `${(((value - min) / (max - min || 1)) * 100).toFixed(2)}%`;
  const emit = (raw: string) => {
    if (raw.trim() === '') return;
    const n = Number(raw);
    if (Number.isFinite(n)) onChange(Math.min(max, Math.max(min, n)));
  };
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 6,
        }}
      >
        <span className="label">
          {label}
          {unit ? <span className="faint"> · {unit}</span> : null}
        </span>
        <span
          className="stat-num"
          style={{ fontSize: 17, color: 'var(--deep-sage)' }}
          aria-hidden
        >
          {display ? display(value) : value}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <input
          type="range"
          className="rng"
          aria-label={label}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => emit(e.target.value)}
          style={{ '--fill': fill } as React.CSSProperties}
        />
        <input
          className="num-chip"
          type="number"
          inputMode="decimal"
          aria-label={`${label} value`}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => emit(e.target.value)}
        />
      </div>
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  const lid = useId();
  return (
    <div className="seg" role="tablist">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button key={o.value} role="tab" aria-selected={on} data-on={on} onClick={() => onChange(o.value)}>
            {on && (
              <motion.span
                layoutId={`seg-${lid}`}
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 999,
                  background: 'var(--deep-sage)',
                  zIndex: -1,
                }}
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            <span style={{ position: 'relative' }}>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* Small line-icon set, sage stroke. */
export function Icon({ name, size = 16 }: { name: string; size?: number }) {
  const p: Record<string, React.ReactNode> = {
    wind: (
      <>
        <path d="M3 8h11a2.5 2.5 0 1 0-2.5-2.5" />
        <path d="M3 12h15a2.5 2.5 0 1 1-2.5 2.5" />
        <path d="M3 16h8" />
      </>
    ),
    solar: (
      <>
        <rect x="3" y="4" width="18" height="11" rx="1" />
        <path d="M3 8h18M3 11.5h18M9 4v11M15 4v11" />
        <path d="M12 18v3M8 21h8" />
      </>
    ),
    mixed: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3a9 9 0 0 0 0 18M3 12h18" />
      </>
    ),
    custom: (
      <>
        <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
        <circle cx="12" cy="12" r="3.2" />
      </>
    ),
    arn: (
      <>
        <path d="M12 3l8 5v8l-8 5-8-5V8z" />
        <path d="M12 3v18M4 8l8 5 8-5" />
      </>
    ),
    bolt: <path d="M13 2 4 14h6l-1 8 9-12h-6z" />,
    plus: <path d="M12 5v14M5 12h14" />,
    copy: (
      <>
        <rect x="8" y="8" width="12" height="12" rx="2" />
        <path d="M4 16V4h12" />
      </>
    ),
    close: <path d="M6 6l12 12M18 6 6 18" />,
    chevron: <path d="M6 9l6 6 6-6" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {p[name] ?? null}
    </svg>
  );
}
