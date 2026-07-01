'use client';

import { INPUTS } from '@/lib/inputs-registry';

// A small inline badge marking a value as confirmed or illustrative.
// Hover/focus shows the source. Keeps investors from reading placeholders as fact.
export function Src({ k }: { k: string }) {
  const m = INPUTS[k];
  if (!m) return null;
  const label = m.status === 'illustrative' ? 'Illustrative' : 'Confirmed';
  return (
    <span
      className={`src src-${m.status}`}
      title={`${label} — ${m.source}`}
      tabIndex={0}
      role="note"
      aria-label={`${label}: ${m.source}`}
    >
      {m.status === 'illustrative' ? '~' : '✓'}
    </span>
  );
}
