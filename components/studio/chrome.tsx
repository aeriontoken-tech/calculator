'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { MINING_PRESETS } from '@/lib/presets';
import { Icon } from './primitives';

function Mark() {
  // minimal geometric tri-band "A"
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden>
      <defs>
        <linearGradient id="mark-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6fa572" />
          <stop offset="1" stopColor="#2f4f38" />
        </linearGradient>
      </defs>
      <path d="M13 3 L21 19 L15.5 19 L13 13 L10.5 19 L5 19 Z" fill="url(#mark-g)" />
      <path d="M9.5 16 L16.5 16 L18 19 L8 19 Z" fill="#8be3a0" opacity="0.85" />
    </svg>
  );
}

export function StudioHeader() {
  return (
    <header
      style={{
        position: 'sticky',
        top: 14,
        zIndex: 50,
        display: 'flex',
        justifyContent: 'center',
        padding: '0 20px',
        pointerEvents: 'none',
      }}
    >
      <motion.div
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 26 }}
        className="glass glass-solid"
        style={{
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          padding: '10px 12px 10px 18px',
          borderRadius: 999,
          width: 'min(980px, 100%)',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Mark />
          <span style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.42em', fontSize: 13, paddingLeft: 4 }}>
            AERION
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="label" style={{ display: 'flex', alignItems: 'center', gap: 7, marginRight: 6 }}>
            <span className="live-dot" /> Simulation Studio
          </span>
          <a className="pill" href="/methodology" style={{ textDecoration: 'none' }}>
            Methodology
          </a>
          <button className="pill pill-accent">Request access</button>
        </div>
      </motion.div>
    </header>
  );
}

export function AddModule({ onAdd }: { onAdd: (presetKey: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass" style={{ padding: 22 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'transparent', border: 0, width: '100%' }}
        aria-expanded={open}
      >
        <span
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: 'var(--deep-sage)',
            color: 'var(--paper-3)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="plus" size={18} />
        </span>
        <span style={{ textAlign: 'left' }}>
          <span className="display" style={{ fontSize: 22, display: 'block' }}>Add a mining module</span>
          <span className="label">Compose a portfolio across sites &amp; energy</span>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 12,
                paddingTop: 18,
              }}
            >
              {MINING_PRESETS.map((p) => (
                <button
                  key={p.key}
                  className="add-chip"
                  onClick={() => {
                    onAdd(p.key);
                    setOpen(false);
                  }}
                >
                  <span style={{ color: 'var(--deep-sage)' }}>
                    <Icon name={p.energyType === 'custom' ? 'custom' : p.energyType} size={18} />
                  </span>
                  <span>
                    <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 13 }}>{p.name}</span>
                    <span className="faint" style={{ fontSize: 11 }}>{p.blurb}</span>
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function LegalFooter({ asOf, source }: { asOf: string; source: string }) {
  const [open, setOpen] = useState(false);
  return (
    <footer style={{ marginTop: 8, paddingBottom: 60 }}>
      <div className="glass" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <p className="faint" style={{ fontSize: 11.5, margin: 0, maxWidth: 620 }}>
            Illustrative scenarios — figures are estimates based on assumptions you control, not a forecast and not a
            guarantee of any result. Not investment advice. Capital is at risk.
          </p>
          <button className="pill" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
            Legal &amp; assumptions
            <motion.span animate={{ rotate: open ? 180 : 0 }} style={{ display: 'inline-flex' }}>
              <Icon name="chevron" size={13} />
            </motion.span>
          </button>
        </div>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ paddingTop: 16, display: 'grid', gap: 10 }}>
                <p className="faint" style={{ fontSize: 11, margin: 0 }}>
                  Market data as of {asOf} · {source}. Payback and margin are computed from your inputs; ARN value
                  scenarios are hypothetical figures you enter, never projected by Aerion.
                </p>
                <p className="faint" style={{ fontSize: 11, margin: 0 }}>
                  This crypto-asset marketing communication has not been reviewed or approved by any competent authority
                  in any Member State of the European Union. The offeror of the crypto-asset is solely responsible for
                  the content of this marketing communication.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </footer>
  );
}
