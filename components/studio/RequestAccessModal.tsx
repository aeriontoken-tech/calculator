'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Icon } from './primitives';

export function RequestAccessModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [company, setCompany] = useState(''); // honeypot
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('sending');
    setErrMsg('');
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, email, message, company }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setState('done');
      else {
        setState('error');
        setErrMsg((data.errors && data.errors[0]) || 'Something went wrong.');
      }
    } catch {
      setState('error');
      setErrMsg('Network error — please try again.');
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(20,28,20,0.42)', backdropFilter: 'blur(6px)', display: 'grid', placeItems: 'center', padding: 20 }}
          role="dialog"
          aria-modal="true"
          aria-label="Request investor access"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="glass glass-solid"
            style={{ width: 'min(460px, 100%)', padding: 30 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="eyebrow no-rule">Investor access</div>
                <div className="display" style={{ fontSize: 26, marginTop: 4 }}>Request access<span className="dot">.</span></div>
              </div>
              <button className="icon-btn" onClick={onClose} aria-label="Close">
                <Icon name="close" size={14} />
              </button>
            </div>

            {state === 'done' ? (
              <div style={{ padding: '24px 0 6px' }}>
                <p className="display" style={{ fontSize: 20 }}>Thank you.</p>
                <p className="muted" style={{ fontSize: 13, marginTop: 8 }}>We&apos;ll be in touch with data-room access shortly.</p>
                <button className="pill pill-accent" style={{ marginTop: 16 }} onClick={onClose}>Close</button>
              </div>
            ) : (
              <form onSubmit={submit} style={{ display: 'grid', gap: 12, marginTop: 20 }}>
                <input aria-label="Name" className="field-input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
                <input aria-label="Email" type="email" className="field-input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <textarea aria-label="Message" className="field-input" placeholder="What would you like to know? (optional)" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
                <input tabIndex={-1} autoComplete="off" aria-hidden value={company} onChange={(e) => setCompany(e.target.value)} style={{ position: 'absolute', left: '-9999px' }} />
                {state === 'error' && <p className="faint" style={{ fontSize: 12, color: '#b06a5a' }}>{errMsg}</p>}
                <button type="submit" className="pill pill-accent" style={{ justifyContent: 'center', padding: '11px 16px' }} disabled={state === 'sending'}>
                  {state === 'sending' ? 'Sending…' : 'Request access'}
                </button>
                <p className="faint" style={{ fontSize: 10.5 }}>
                  Illustrative scenarios only — not investment advice. We use your details solely to respond.
                </p>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
