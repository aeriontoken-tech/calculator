// Theme bootstrap for /embed/dashboard — the combined Operator Console embed
// (ARN Position + Access & Mining Boost stacked) placed inside the Aerion
// dashboard. Same behavior as /embed/access: dark/light driven by ?theme= and
// by 'aerion-embed-theme' messages. Inlined so it runs before first paint and
// before React hydrates:
// 1. Sets data-embed-theme from the ?theme= query param (host dashboards load
//    /embed/*?theme=dark; no param means light).
// 2. Attaches the 'aerion-embed-theme' message listener immediately — hosts
//    post the current theme on iframe `load`, which fires before hydration,
//    so a React-side listener alone would miss that first message.
// EmbedShell registers a second listener after hydration that additionally
// honors NEXT_PUBLIC_EMBED_THEME_ORIGINS; both setting the same attribute is
// idempotent.
const THEME_BOOT = `(function () {
  var root = document.documentElement;
  try {
    root.setAttribute('data-embed-theme',
      new URLSearchParams(location.search).get('theme') === 'dark' ? 'dark' : 'light');
  } catch (e) { root.setAttribute('data-embed-theme', 'light'); }
  var ok = function (o) {
    return o === 'https://aeriontoken.io' || o === 'https://www.aeriontoken.io' ||
      /^https?:\\/\\/(localhost|127\\.0\\.0\\.1)(:\\d+)?$/.test(o);
  };
  window.addEventListener('message', function (e) {
    if (!ok(e.origin)) return;
    var d = e.data;
    if (d && d.type === 'aerion-embed-theme' && (d.theme === 'dark' || d.theme === 'light')) {
      root.setAttribute('data-embed-theme', d.theme);
    }
  });
})();`;

export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      {children}
    </>
  );
}
