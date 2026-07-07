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
  style="width:100%;border:0;display:block"
  loading="lazy"
  scrolling="no"
></iframe>

<iframe
  src="https://calc.aeriontoken.io/embed/access"
  class="aerion-embed"
  title="Aerion — Access & node calculator"
  style="width:100%;border:0;display:block"
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

- The iframe content ships its own background, fonts and styles — the host
  page's CSS cannot leak in (and vice versa).
- Embed pages are `noindex`; the canonical experience stays on
  `calc.aeriontoken.io`.
- To embed from a different deployment (e.g. a preview URL), change the
  `src` and the `e.origin` check together.
