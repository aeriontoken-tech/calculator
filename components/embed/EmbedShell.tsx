'use client';

import { useEffect, useRef } from 'react';

// Hosts that are allowed to switch the embed theme via postMessage.
// Extend with staging origins through NEXT_PUBLIC_EMBED_THEME_ORIGINS
// (comma-separated); localhost is always allowed for development.
const THEME_ORIGINS = new Set(
  [
    'https://aeriontoken.io',
    'https://www.aeriontoken.io',
    ...(process.env.NEXT_PUBLIC_EMBED_THEME_ORIGINS ?? '').split(','),
  ]
    .map((s) => s.trim())
    .filter(Boolean),
);
const isThemeOrigin = (origin: string) =>
  THEME_ORIGINS.has(origin) || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

// Wraps an embedded panel and reports its rendered height to the parent page
// via postMessage, so the host <iframe> can auto-size without scrollbars.
// Height is not sensitive, so '*' as targetOrigin is fine for the outbound
// message; inbound theme messages are origin-checked above.
//
// Skins:
// - 'console' (/embed/access): Operator Console tokens, dark/light driven by
//   ?theme= (stamped pre-paint in app/embed/access/layout.tsx) and by
//   'aerion-embed-theme' messages.
// - 'landing' (/embed/investment): studio palette tuned to the aeriontoken.io
//   landing section cards; ignores theme params/messages entirely.
export function EmbedShell({
  id,
  children,
  skin,
}: {
  id: string;
  children: React.ReactNode;
  skin?: 'console' | 'landing';
}) {
  const consoleSkin = skin === 'console';
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.parent === window) return;
    const post = () =>
      window.parent.postMessage(
        { type: 'aerion-embed-height', id, height: Math.ceil(el.getBoundingClientRect().height) },
        '*',
      );
    const ro = new ResizeObserver(post);
    ro.observe(el);
    post();
    return () => ro.disconnect();
  }, [id]);

  useEffect(() => {
    if (!consoleSkin) return;
    const onMessage = (e: MessageEvent) => {
      if (!isThemeOrigin(e.origin)) return;
      const d: unknown = e.data;
      if (!d || typeof d !== 'object' || (d as { type?: unknown }).type !== 'aerion-embed-theme') return;
      const theme = (d as { theme?: unknown }).theme;
      if (theme === 'dark' || theme === 'light') {
        document.documentElement.setAttribute('data-embed-theme', theme);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [consoleSkin]);

  return (
    <div ref={ref} className={skin ? `embed-shell embed-${skin}` : 'embed-shell'}>
      {children}
    </div>
  );
}
