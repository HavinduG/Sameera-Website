import { fallbackAcf } from "@/lib/fallback-content";

export const HOME_TAG = "wp-home";

export type WPImage = {
  url: string;
  alt: string;
  width?: number;
  height?: number;
};

export type NavItem = { label: string; url: string };

export type StatItem = {
  prefix: string;
  value: string;
  suffix: string;
  title: string;
  description: string;
};

/** One block of the `about_description` WYSIWYG. `html` is sanitized inline markup. */
export type AboutBlock =
  | { type: "paragraph"; html: string }
  | { type: "quote"; text: string }
  | { type: "list"; items: string[] };

export type AboutContent = {
  title: string;
  blocks: AboutBlock[];
  image: WPImage | null;
  /** Heading + intro that sit above the outcome cards ("Here is how I can help you"). */
  outcomesTitle: string;
  outcomesIntro: string;
  outcomes: string[];
};

/** One bullet from an expertise card: the bold lead-in ("Meta & TikTok.") and the sanitized rest. */
export type ExpertisePoint = { lead: string; html: string };

export type ExpertiseCard = {
  title: string;
  summary: string;
  image: WPImage | null;
  points: ExpertisePoint[];
};

export type ExpertiseContent = {
  title: string;
  description: string;
  cards: ExpertiseCard[];
};

export type HomeContent = {
  name: string;
  navItems: NavItem[];
  navButton: { text: string; url: string };
  heroImage: WPImage | null;
  roles: string[];
  description: string;
  primaryCta: { text: string; url: string };
  secondaryCta: { text: string; url: string };
  education: string;
  stats: StatItem[];
  about: AboutContent | null;
  expertise: ExpertiseContent | null;
  whatsappUrl: string | null;
};

const WORDPRESS_URL = (
  process.env.WORDPRESS_URL ??
  process.env.NEXT_PUBLIC_WORDPRESS_URL ??
  ""
).replace(/\/+$/, "");
const HOME_SLUG = process.env.WP_HOME_SLUG ?? "home-page";

type Raw = Record<string, unknown>;

// ACF returns `false` (or null / "") for empty fields, so coerce everything defensively.
const str = (v: unknown, fallback = "") =>
  typeof v === "string" ? v : typeof v === "number" ? String(v) : fallback;

const list = (v: unknown): Raw[] =>
  Array.isArray(v) ? v.filter((x): x is Raw => !!x && typeof x === "object") : [];

function toImage(v: unknown): WPImage | null {
  if (typeof v === "string" && v) return { url: v, alt: "" };
  if (v && typeof v === "object") {
    const img = v as Raw;
    const url = str(img.url);
    if (!url) return null;
    return {
      url,
      alt: str(img.alt),
      width: typeof img.width === "number" ? img.width : undefined,
      height: typeof img.height === "number" ? img.height : undefined,
    };
  }
  return null;
}

// Empty URL fields fall back to an in-page anchor, e.g. "Results" -> "#results".
const url = (v: unknown, fallback: string) => str(v).trim() || fallback;
const anchor = (label: string) =>
  `#${label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", times: "×" };
const decode = (s: string) =>
  s.replace(/&(#x[\da-f]+|#\d+|\w+);/gi, (m, e: string) =>
    e[0] === "#"
      ? String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10))
      : (ENTITIES[e.toLowerCase()] ?? m)
  );
const text = (html: string) => decode(html.replace(/<[^>]*>/g, "")).replace(/\s+/g, " ").trim();
const byClass = (cls: string, tag: string) =>
  new RegExp(`<${tag}[^>]*class="[^"]*\\b${cls}\\b[^"]*"[^>]*>([\\s\\S]*?)</${tag}>`, "i");

/**
 * The `revenue_cards` WYSIWYG holds markup like
 * `<div class="metric"><small>USD</small><span class="counted">4.5</span><small>Mn</small>…</div><div class="l">Label</div>`.
 * Split it into prefix / number / suffix / label so the card can animate the number.
 */
function parseRevenueCard(card: Raw): StatItem {
  const html = str(card.count_of_card);
  const description = text(str(card.count_card_description));
  const metric = html.match(byClass("metric", "div"))?.[1] ?? html.replace(byClass("l", "div"), "");
  const title = text(html.match(byClass("l", "div"))?.[1] ?? "");
  const counted = metric.match(byClass("counted", "span"));

  if (!counted || counted.index === undefined) {
    return { prefix: "", value: text(metric), suffix: "", title, description };
  }
  return {
    prefix: text(metric.slice(0, counted.index)),
    value: text(counted[1]),
    suffix: text(metric.slice(counted.index + counted[0].length)).replace(/\s+/g, ""),
    title,
    description,
  };
}

function toStats(acf: Raw): StatItem[] {
  const cards = list(acf.revenue_cards);
  const stats = cards.length
    ? cards.map(parseRevenueCard)
    : list(acf.stats).map((s) => ({
        prefix: str(s.prefix),
        value: str(s.value),
        suffix: str(s.suffix),
        title: str(s.title),
        description: str(s.description),
      }));
  return stats.filter((s) => s.value);
}

// Keep only harmless inline tags from the WYSIWYG; everything else is stripped to text.
const INLINE_TAGS = new Set(["strong", "b", "em", "i", "br", "a"]);
const SAFE_HREF = /^(https?:|mailto:|tel:|#|\/)/i;

function sanitizeInline(html: string) {
  return html
    .replace(/<(script|style|iframe)[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<(\/?)([a-z0-9]+)([^>]*)>/gi, (_, close: string, tag: string, attrs: string) => {
      const name = tag.toLowerCase();
      if (!INLINE_TAGS.has(name)) return "";
      if (close) return `</${name}>`;
      if (name !== "a") return `<${name}>`;
      const href = attrs.match(/href\s*=\s*"([^"]*)"/i)?.[1] ?? "";
      return SAFE_HREF.test(href)
        ? `<a href="${href.replace(/"/g, "&quot;")}" rel="noopener noreferrer">`
        : "<a>";
    })
    .trim();
}

const BLOCK = /<(p|h[1-6]|blockquote|ul|ol)\b([^>]*)>([\s\S]*?)<\/\1>/gi;

/**
 * Splits the about WYSIWYG into blocks. A `.quote` heading (or <blockquote>) becomes a pull quote;
 * the first other heading and the paragraphs after it become the intro for the outcome cards.
 */
function parseAbout(html: string) {
  const blocks: AboutBlock[] = [];
  let outcomesTitle = "";
  const intro: string[] = [];

  for (const [, rawTag, attrs, inner] of html.matchAll(BLOCK)) {
    const tag = rawTag.toLowerCase();
    const isQuote = tag === "blockquote" || /class="[^"]*\bquote\b/i.test(attrs);

    if (outcomesTitle) {
      if (text(inner)) intro.push(text(inner));
    } else if (isQuote) {
      if (text(inner)) blocks.push({ type: "quote", text: text(inner) });
    } else if (tag.startsWith("h")) {
      outcomesTitle = text(inner);
    } else if (tag === "ul" || tag === "ol") {
      const items = [...inner.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((m) => sanitizeInline(m[1])).filter(Boolean);
      if (items.length) blocks.push({ type: "list", items });
    } else if (text(inner)) {
      blocks.push({ type: "paragraph", html: sanitizeInline(inner) });
    }
  }

  // Plain text without block tags (e.g. the editor's text mode).
  if (!blocks.length && !outcomesTitle && text(html)) {
    blocks.push({ type: "paragraph", html: sanitizeInline(html) });
  }
  return { blocks, outcomesTitle, outcomesIntro: intro.join(" ") };
}

function toAbout(acf: Raw): AboutContent | null {
  const title = text(str(acf.main_title_of_about_ ?? acf.main_title_of_about));
  const { blocks, outcomesTitle, outcomesIntro } = parseAbout(str(acf.about_description));
  const outcomes = list(acf.about_cards)
    .map((c) => text(str(c.about_card)))
    .filter(Boolean);

  if (!title && !blocks.length && !outcomes.length) return null;
  return { title, blocks, image: toImage(acf.about_image), outcomesTitle, outcomesIntro, outcomes };
}

/**
 * Turns an expertise WYSIWYG into bullet points. Each `<li><b>Lead.</b> Rest</li>` is split so the
 * lead can be styled separately; paragraphs (no list) become points without a lead.
 */
function parsePoints(html: string): ExpertisePoint[] {
  const items = [...html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((m) => m[1]);
  const sources = items.length
    ? items
    : [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => m[1]);
  if (!sources.length && text(html)) sources.push(html);

  return sources
    .map((inner) => {
      const lead = inner.match(/^\s*<(b|strong)\b[^>]*>([\s\S]*?)<\/\1>/i);
      return lead
        ? { lead: text(lead[2]), html: sanitizeInline(inner.slice(lead[0].length)) }
        : { lead: "", html: sanitizeInline(inner) };
    })
    .filter((p) => p.lead || text(p.html));
}

function toExpertise(acf: Raw): ExpertiseContent | null {
  const title = text(str(acf.expertise_title));
  const description = text(str(acf.expertise_description));
  const cards = list(acf.expertise_cards)
    .map((c) => ({
      title: text(str(c.expertise_title)),
      summary: text(str(c.expertise_short_description)),
      image: toImage(c.expertise_image),
      points: parsePoints(str(c.expertise_description)),
    }))
    .filter((c) => c.title || c.summary || c.points.length);

  if (!title && !description && !cards.length) return null;
  return { title, description, cards };
}

export function normalizeHome(acf: Raw): HomeContent {
  return {
    name: str(acf.name).trim() || "Sameera Rajapakshe",
    navItems: list(acf.nav_bar)
      .map((i) => {
        const label = str(i.menu_name).trim();
        return { label, url: url(i.menu_url, anchor(label)) };
      })
      .filter((i) => i.label),
    navButton: { text: str(acf.button_1).trim(), url: url(acf.button_1_url, "#contact") },
    heroImage: toImage(acf.hero_image),
    roles: list(acf.main_roles)
      .map((r) => str(r.job_role).trim())
      .filter(Boolean),
    description: str(acf.hero_description).trim(),
    primaryCta: { text: str(acf.button_2).trim(), url: url(acf.button_2_url, "#contact") },
    secondaryCta: {
      text: str(acf.button_2_2_hero).trim(),
      url: url(acf.button_2_2_hero_url, "#highlights"),
    },
    education: str(acf.education).trim(),
    stats: toStats(acf),
    about: toAbout(acf),
    expertise: toExpertise(acf),
    whatsappUrl: str(acf.whatsapp_url).trim() || null,
  };
}

/**
 * Fetches the home page ACF fields from the WordPress REST API.
 * Cached with ISR (60s) and tagged so `/api/revalidate` can refresh it instantly.
 */
export async function getHomePage(): Promise<HomeContent> {
  if (!WORDPRESS_URL) return normalizeHome(fallbackAcf);

  const url = `${WORDPRESS_URL}/wp-json/wp/v2/pages?slug=${encodeURIComponent(
    HOME_SLUG
  )}&acf_format=standard&_fields=id,acf`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 60, tags: [HOME_TAG] },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const pages: unknown = await res.json();
    const acf = Array.isArray(pages) ? (pages[0] as Raw | undefined)?.acf : undefined;
    if (!acf || typeof acf !== "object") {
      throw new Error(`No ACF fields on page "${HOME_SLUG}"`);
    }
    return normalizeHome(acf as Raw);
  } catch (error) {
    console.warn(
      `[wordpress] Falling back to bundled content (${url}):`,
      error instanceof Error ? error.message : error
    );
    return normalizeHome(fallbackAcf);
  }
}
