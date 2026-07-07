# Embedding calculator sections in an external landing page

Two sections are exposed as standalone, chrome-free embed routes:

| Section          | URL                                            |
| ---------------- | ---------------------------------------------- |
| ARN investment   | `https://calc.aeriontoken.io/embed/investment` |
| Access & node    | `https://calc.aeriontoken.io/embed/access`     |

Each embed page measures its own rendered height and reports it to the host
page with `postMessage` (`{ type: 'aerion-embed-height', id, height }`), so
the iframe can auto-size without inner scrollbars.

## Snippet for the landing page

Paste the iframes wherever the sections should appear, and include the resize
script once (before `</body>`):

```html
<iframe
  src="https://calc.aeriontoken.io/embed/investment"
  class="aerion-embed"
  title="Aerion — ARN investment calculator"
  style="width:100%;border:0;display:block;background:transparent;color-scheme:light"
  loading="lazy"
  scrolling="no"
></iframe>

<iframe
  src="https://calc.aeriontoken.io/embed/access"
  class="aerion-embed"
  title="Aerion — Access & node calculator"
  style="width:100%;border:0;display:block;background:transparent;color-scheme:light"
  loading="lazy"
  scrolling="no"
></iframe>

<script>
  window.addEventListener('message', function (e) {
    if (e.origin !== 'https://calc.aeriontoken.io') return;
    var d = e.data;
    if (!d || d.type !== 'aerion-embed-height') return;
    document.querySelectorAll('iframe.aerion-embed').forEach(function (f) {
      if (f.contentWindow === e.source) f.style.height = d.height + 'px';
    });
  });
</script>
```

Notes:

- The embed shows **only the card itself** — the document behind it is
  transparent and there is zero outer padding, so the host page fully controls
  spacing, and the landing background shows through around the card's rounded
  corners. Add any margin/max-width on the host side.
- The card's fonts and styles are self-contained — the host page's CSS cannot
  leak in (and vice versa).
- Embed pages are `noindex`; the canonical experience stays on
  `calc.aeriontoken.io`.
- To embed from a different deployment (e.g. a preview URL), change the
  `src` and the `e.origin` check together.

## Dark / light theme — `/embed/access` only

The access embed follows the host's theme (Operator Console tokens, Brand
Brief v1.0). **`/embed/investment` is not themed**: it always renders the
studio palette, ignores `?theme=` and theme messages, and is meant for the
light landing page.

- **First paint:** pass `?theme=dark` in the iframe `src`
  (e.g. `https://calc.aeriontoken.io/embed/access?theme=dark`).
  No param (or `?theme=light`) renders light.
- **Live switching:** post a message into the iframe whenever the host theme
  changes (and once on iframe `load`):

  ```js
  iframe.contentWindow.postMessage(
    { type: 'aerion-embed-theme', theme: 'dark' }, // or 'light'
    'https://calc.aeriontoken.io',
  );
  ```

  The embed only accepts theme messages from `https://aeriontoken.io`,
  `https://www.aeriontoken.io`, and localhost. Staging origins can be added
  via the `NEXT_PUBLIC_EMBED_THEME_ORIGINS` env var (comma-separated) on the
  calc deployment.
- The document background stays transparent in both themes, and the embed's
  `color-scheme` deliberately stays `light` even when the dark tokens are
  active — switching it to `dark` would make browsers composite the
  cross-origin iframe on an opaque white canvas (the white-corner bug).

## Troubleshooting: white showing around the card's rounded corners

The iframe document itself is transparent, so anything visible around the
card corners comes from whatever paints behind/over the iframe on the host
page. Check in order:

1. **The element directly behind the iframe** — a section/wrapper `<div>`
   with `background: #fff` shows through the transparent corners. Give that
   wrapper the page background (or none).
2. **Host CSS styling iframes** — e.g. a global `iframe { background: … }`
   rule. The inline `background:transparent` in the snippet wins unless the
   rule uses `!important`.
3. **Color-scheme mismatch** — if the host page declares `color-scheme: dark`
   (or resolves dark via `light dark`), browsers composite the iframe on an
   opaque white canvas. The `color-scheme:light` inline style on the iframe
   plus the embed document's own `color-scheme: light` keep the two matched.
