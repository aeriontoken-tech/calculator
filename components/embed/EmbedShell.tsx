'use client';

import { useEffect, useRef } from 'react';

// Wraps an embedded panel and reports its rendered height to the parent page
// via postMessage, so the host <iframe> can auto-size without scrollbars.
// Height is not sensitive, so '*' as targetOrigin is fine here.
export function EmbedShell({ id, children }: { id: string; children: React.ReactNode }) {
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

  return (
    <div ref={ref} className="embed-shell">
      {children}
    </div>
  );
}
