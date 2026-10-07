/**
 * Allowlist sanitizer for rich WordPress HTML (the result case-study bodies).
 *
 * Keeps structural/text tags, a small set of attributes and the classes the case-study styles
 * know about (see `.case-study` in globals.css). Everything else is dropped: scripts and
 * embeds are removed with their content, unknown tags are unwrapped so their text survives,
 * and images keep only absolute http(s) sources.
 */

const ALLOWED_TAGS = new Set([
  "div", "section", "aside", "article", "header", "footer",
  "h2", "h3", "h4", "h5", "h6", "p", "blockquote", "hr", "br",
  "ul", "ol", "li", "strong", "b", "em", "i", "small", "span", "sub", "sup", "a",
  "figure", "figcaption", "img",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption",
]);

const VOID_TAGS = new Set(["br", "hr", "img"]);

// Classes used by the case-study markup that we style; the rest ("reveal", "in", WP's
// "alignnone size-medium" …) are discarded.
const ALLOWED_CLASSES = new Set([
  "cs-grid", "cs-copy", "cs-facts", "cs-evidence", "cs-numbers", "cs-result",
  "k", "ticks", "lede", "small", "shot", "cap", "what", "n", "table-wrap", "case-table", "quote",
]);

const DROP_WITH_CONTENT = /<(script|style|iframe|object|embed|noscript|template|svg|math|form|select|textarea)\b[\s\S]*?<\/\1\s*>/gi;
const SAFE_HREF = /^(https?:|mailto:|tel:|#|\/)/i;
const HTTP_URL = /^https?:\/\//i;

const escapeAttr = (v: string) =>
  v.replace(/&(?!(#\d+|#x[\da-f]+|\w+);)/gi, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function parseAttrs(raw: string) {
  const attrs: Record<string, string> = {};
  for (const m of raw.matchAll(/([^\s"'=<>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g)) {
    attrs[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? "";
  }
  return attrs;
}

/** Largest candidate from a `srcset`, so screenshots show at full resolution. */
function largestFromSrcset(srcset: string) {
  let best = "";
  let bestW = -1;
  for (const part of srcset.split(",")) {
    const [url, size = ""] = part.trim().split(/\s+/);
    const w = parseInt(size, 10) || 0;
    if (url && HTTP_URL.test(url) && w > bestW) {
      best = url;
      bestW = w;
    }
  }
  return best;
}

function buildTag(tag: string, rawAttrs: string): string {
  const a = parseAttrs(rawAttrs);
  const out: string[] = [];

  const classes = (a.class ?? "").split(/\s+/).filter((c) => ALLOWED_CLASSES.has(c));
  if (classes.length) out.push(`class="${classes.join(" ")}"`);
  if (a["aria-label"]) out.push(`aria-label="${escapeAttr(a["aria-label"])}"`);

  if (tag === "a") {
    const href = (a.href ?? "").trim();
    if (SAFE_HREF.test(href)) {
      out.push(`href="${escapeAttr(href)}"`);
      if (HTTP_URL.test(href)) out.push(`target="_blank" rel="noopener noreferrer"`);
    }
  }

  if (tag === "img") {
    const src = largestFromSrcset(a.srcset ?? "") || (HTTP_URL.test(a.src ?? "") ? a.src : "");
    if (!src) return ""; // relative/unknown sources would 404 on this site
    out.push(`src="${escapeAttr(src)}"`, `alt="${escapeAttr(a.alt ?? "")}"`, `loading="lazy"`, `decoding="async"`);
    for (const dim of ["width", "height"]) if (/^\d+$/.test(a[dim] ?? "")) out.push(`${dim}="${a[dim]}"`);
  }

  if (tag === "th" || tag === "td") {
    for (const span of ["colspan", "rowspan"]) if (/^\d+$/.test(a[span] ?? "")) out.push(`${span}="${a[span]}"`);
  }

  return `<${tag}${out.length ? " " + out.join(" ") : ""}>`;
}

export function sanitizeRichHtml(html: string): string {
  return (
    html
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(DROP_WITH_CONTENT, "")
      // Buttons only work with the original site's JS: keep an image they wrap, drop pure actions
      // ("Open full size"); zooming is handled by our own lightbox instead.
      .replace(/<button\b[^>]*>([\s\S]*?)<\/button\s*>/gi, (_, inner: string) => (/<img\b/i.test(inner) ? inner : ""))
      .replace(/<(\/?)([a-zA-Z][a-zA-Z0-9-]*)\b([^>]*)>/g, (_, close: string, rawTag: string, attrs: string) => {
        const tag = rawTag.toLowerCase();
        if (!ALLOWED_TAGS.has(tag)) return "";
        if (close) return VOID_TAGS.has(tag) ? "" : `</${tag}>`;
        return buildTag(tag, attrs.replace(/\/\s*$/, ""));
      })
      .trim()
  );
}
