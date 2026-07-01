'use client';

// Faint flowing energy lines drifting behind the studio — atmosphere, not content.
const LINES = [
  { d: 'M-100,180 C300,80 700,300 1540,140', o: 0 },
  { d: 'M-100,360 C400,260 900,460 1540,330', o: 1.6 },
  { d: 'M-100,560 C350,500 850,640 1540,520', o: 3.1 },
  { d: 'M-100,740 C450,690 950,820 1540,700', o: 2.2 },
];

export function EnergyField() {
  return (
    <div className="energy-field" aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        style={{ opacity: 0.5 }}
      >
        {LINES.map((l, i) => (
          <g key={i}>
            <path d={l.d} fill="none" stroke="rgba(75,119,85,0.16)" strokeWidth="1" />
            <path
              className="flow"
              d={l.d}
              fill="none"
              stroke="rgba(139,227,160,0.7)"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeDasharray="3 240"
              style={{ animationDelay: `${l.o}s` }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
