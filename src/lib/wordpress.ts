import { fallbackAcf } from "@/lib/fallback-content";
import { sanitizeRichHtml } from "@/lib/rich-html";

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

/** One counting card on a result ("5,364" · "Leads Account total"). */
export type ResultMetric = { value: string; label: string };

export type ResultCard = {
  /** URL segment for /results/[slug], derived from the title. */
  slug: string;
  title: string;
  /** Plain-text summary (from `result_card_title_description`). */
  summary: string;
  image: WPImage | null;
  metrics: ResultMetric[];
  /** Sanitized case-study HTML (from `result_card_long_description_`), only shown on the detail page. */
  body: string;
};

export type ResultsContent = {
  title: string;
  description: string;
  cards: ResultCard[];
};

export type ProductionImage = WPImage & { caption: string };

export type ProductionContent = {
  title: string;
  /** Small label from the description's `<span class="eyebrow">`, e.g. "Creative direction & media production". */
  eyebrow: string;
  /** Sanitized inline HTML paragraphs. */
  paragraphs: string[];
  /** Bullet list from the description, as plain text. */
  capabilities: string[];
  images: ProductionImage[];
};

export type ClientsContent = {
  title: string;
  description: string;
  logos: WPImage[];
  /** Industry labels from `cleints_work_texts` (sic, as named in ACF). */
  industries: string[];
};

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  image: WPImage | null;
};

export type TestimonialsContent = {
  title: string;
  description: string;
  items: Testimonial[];
};

export type StackContent = {
  title: string;
  /** The two disciplines ("Creative & production", "Media & measurement"). */
  areas: { title: string; description: string }[];
  tools: { name: string; image: WPImage | null }[];
};

export type CredentialsContent = {
  title: string;
  /** Degrees, diplomas and memberships. */
  education: { qualification: string; level: string; institute: string }[];
  /** Certifications and awards with their badge images. */
  awards: { name: string; issuer: string; image: WPImage | null }[];
};

export type ProcessContent = {
  title: string;
  description: string;
  steps: { title: string; description: string; image: WPImage | null }[];
  /** Service names from `process_words`, shown as a scrolling ribbon. */
  services: string[];
};

export type ContactKind = "whatsapp" | "email" | "phone" | "linkedin" | "link" | "booking";

export type ContactLink = {
  kind: ContactKind;
  label: string;
  /** Raw value from WordPress, e.g. the number or address (empty for buttons). */
  value: string;
  href: string;
  /** External links open in a new tab. */
  external: boolean;
  image: WPImage | null;
};

export type ContactContent = {
  title: string;
  description: string;
  image: WPImage | null;
  buttons: ContactLink[];
  details: ContactLink[];
  linkedinUrl: string | null;
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
  results: ResultsContent | null;
  production: ProductionContent | null;
  clients: ClientsContent | null;
  testimonials: TestimonialsContent | null;
  stack: StackContent | null;
  credentials: CredentialsContent | null;
  process: ProcessContent | null;
  contact: ContactContent | null;
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

const slugify = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");

function toResults(acf: Raw): ResultsContent | null {
  const title = text(str(acf.result_title));
  const description = text(str(acf.result_description));
  const used = new Set<string>();

  const cards = list(acf.result_cards)
    .map((c, i): ResultCard => {
      const cardTitle = text(str(c.result_card_title));
      // Unique, stable slug; falls back to the position if the title is empty.
      const base = slugify(cardTitle) || `case-${i + 1}`;
      let slug = base;
      for (let n = 2; used.has(slug); n++) slug = `${base}-${n}`;
      used.add(slug);

      return {
        slug,
        title: cardTitle,
        summary: text(str(c.result_card_title_description)),
        image: toImage(c.result_file),
        metrics: list(c.result_card_counting_cards)
          .map((m) => ({
            value: text(str(m.result_card_counting_card_count)),
            label: text(str(m.result_card_counting_cards_text)),
          }))
          .filter((m) => m.value),
        body: sanitizeRichHtml(str(c.result_card_long_description_ ?? c.result_card_long_description)),
      };
    })
    .filter((c) => c.title || c.summary || c.metrics.length);

  if (!title && !description && !cards.length) return null;
  return { title, description, cards };
}

function toProduction(acf: Raw): ProductionContent | null {
  const html = str(acf.production_description);
  const title = text(str(acf.production_title));

  // The eyebrow sits in its own <p><span class="eyebrow">…</span></p>; lift it out of the paragraphs.
  const eyebrow = text(html.match(byClass("eyebrow", "span"))?.[1] ?? "");
  const withoutLists = html.replace(/<(ul|ol)\b[\s\S]*?<\/\1>/gi, "");
  const paragraphs = [...withoutLists.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((m) => m[1])
    .filter((inner) => !/class="[^"]*\beyebrow\b/i.test(inner) && text(inner))
    .map(sanitizeInline);
  if (!paragraphs.length && !/<p\b/i.test(withoutLists) && text(withoutLists)) {
    paragraphs.push(sanitizeInline(withoutLists));
  }

  const capabilities = [...html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((m) => text(m[1])).filter(Boolean);

  const images = list(acf.production_images)
    .map((row) => {
      // The ACF sub-field is spelled "production_imagee" in WordPress.
      const raw = row.production_imagee ?? row.production_image;
      const image = toImage(raw);
      if (!image) return null;
      const caption = raw && typeof raw === "object" ? text(str((raw as Raw).caption)) : "";
      return { ...image, caption };
    })
    .filter((img): img is ProductionImage => !!img);

  if (!title && !paragraphs.length && !capabilities.length && !images.length) return null;
  return { title, eyebrow, paragraphs, capabilities, images };
}

function toClients(acf: Raw): ClientsContent | null {
  const title = text(str(acf.clients_title));
  const description = text(str(acf.clients_description));
  const logos = list(acf.clients_logo)
    .map((row) => toImage(row.clients_work))
    .filter((img): img is WPImage => !!img);
  // ACF field names are misspelled in WordPress ("cleints_work_textt"); accept the corrected spelling too.
  const industries = list(acf.cleints_work_texts ?? acf.clients_work_texts)
    .map((row) => text(str(row.cleints_work_textt ?? row.clients_work_text)))
    .filter(Boolean);

  if (!title && !logos.length && !industries.length) return null;
  return { title, description, logos, industries };
}

function toTestimonials(acf: Raw): TestimonialsContent | null {
  const title = text(str(acf.testimonials_title));
  const description = text(str(acf.testimonials_description));
  const items = list(acf.testimonials_cards)
    .map((card) => ({
      quote: text(str(card.testimonials_card_description)),
      name: text(str(card.testimonials_cards_client_title)),
      role: text(str(card.testimonials_cards_client_sub_title)),
      image: toImage(card.testimonials_cards_client_image),
    }))
    .filter((t) => t.quote);

  if (!items.length) return null;
  return { title, description, items };
}

function toStack(acf: Raw): StackContent | null {
  const title = text(str(acf.stack_title));
  const areas = list(acf.stack_cards)
    .map((c) => ({ title: text(str(c.stack_title)), description: text(str(c.stack_description)) }))
    .filter((a) => a.title || a.description);
  // The ACF repeater is named "_tools" in WordPress; accept "tools" too.
  const tools = list(acf._tools ?? acf.tools)
    .map((t) => ({ name: text(str(t.tool_name)), image: toImage(t.tool_image) }))
    .filter((t) => t.name || t.image);

  if (!title && !areas.length && !tools.length) return null;
  return { title, areas, tools };
}

// Close a dangling "(" left in WordPress, e.g. "AMSLIM (SL" -> "AMSLIM (SL)".
const balanceParens = (s: string) => {
  const open = (s.match(/\(/g) ?? []).length - (s.match(/\)/g) ?? []).length;
  return open > 0 ? s + ")".repeat(open) : s;
};

function toCredentials(acf: Raw): CredentialsContent | null {
  const title = text(str(acf.education_title));
  // Note the ACF naming: "education_institute" holds the qualification, "education_description" the institution.
  const education = list(acf.education_cards)
    .map((c) => ({
      qualification: text(str(c.education_institute)).replace(/[,;:]\s*$/, ""),
      level: balanceParens(text(str(c.education_level))),
      institute: text(str(c.education_description)),
    }))
    .filter((e) => e.qualification || e.level);
  const awards = list(acf.license_and_awards)
    .map((a) => ({
      name: text(str(a.license_and_awards_name)),
      issuer: text(str(a.license_and_awards_description)),
      image: toImage(a.license_and_award_image),
    }))
    .filter((a) => a.name || a.image);

  if (!title && !education.length && !awards.length) return null;
  return { title, education, awards };
}

function toProcess(acf: Raw): ProcessContent | null {
  const title = text(str(acf.process_title));
  const description = text(str(acf.process_description));
  const steps = list(acf.process_cards)
    .map((c) => ({
      title: text(str(c.process_card_title)),
      description: text(str(c.process_card_description)),
      image: toImage(c.process_card_image),
    }))
    .filter((s) => s.title || s.description);
  // The ACF sub-field is spelled "process_wordss" in WordPress.
  const services = list(acf.process_words)
    .map((w) => text(str(w.process_wordss ?? w.process_word)))
    .filter(Boolean);

  if (!title && !steps.length && !services.length) return null;
  return { title, description, steps, services };
}

/** Country code applied to local WhatsApp numbers that start with 0 (e.g. "077…" in Sri Lanka). */
const DEFAULT_COUNTRY_CODE = process.env.CONTACT_COUNTRY_CODE ?? "94";

function contactKind(label: string, value = ""): ContactKind {
  const l = label.toLowerCase();
  if (/whats\s?app/.test(l)) return "whatsapp";
  // Matches "LinkedIn", "Linked in" and the "Linkedn" typo used in WordPress.
  if (/\blink(ed)?\s?i?n\b/.test(l) || /linkedin\.com/i.test(value)) return "linkedin";
  if (/e-?mail/.test(l) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "email";
  if (/phone|call me|mobile|tel/.test(l)) return "phone";
  if (/book|discover|schedul|meeting|call/.test(l)) return "booking";
  return "link";
}

// "LinkedIn" is often typed as "Linkedn" in WordPress; show the brand name correctly.
const tidyLabel = (label: string, kind: ContactKind) =>
  kind === "linkedin" && /^link(ed)?i?n$/i.test(label.replace(/\s+/g, "")) ? "LinkedIn" : label;

function whatsappHref(value: string) {
  let digits = value.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  else if (digits.startsWith("00")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = DEFAULT_COUNTRY_CODE + digits.slice(1);
  return digits ? `https://wa.me/${digits}` : "";
}

/** Turns a contact detail ("0778…", "name@…", a LinkedIn handle) into a working link. */
function detailHref(kind: ContactKind, value: string) {
  if (/^https?:\/\//i.test(value)) return value;
  switch (kind) {
    case "whatsapp":
      return whatsappHref(value);
    case "email":
      return value.includes("@") ? `mailto:${value}` : "";
    case "phone":
      return value ? `tel:${value.replace(/[^\d+]/g, "")}` : "";
    case "linkedin":
      return value ? `https://www.linkedin.com/in/${value.replace(/^@|^\/?in\//, "")}` : "";
    default:
      return "";
  }
}

function toContact(acf: Raw): ContactContent | null {
  const title = text(str(acf.contact_title));
  const description = text(str(acf.contact_description));

  const details: ContactLink[] = list(acf.contact_details)
    .map((d) => {
      const rawLabel = text(str(d.contact_name));
      const value = text(str(d.contact_detail));
      const kind = contactKind(rawLabel, value);
      const href = detailHref(kind, value);
      return {
        kind,
        label: tidyLabel(rawLabel, kind),
        value,
        href,
        external: /^https?:/i.test(href),
        image: toImage(d.contact_name_image),
      };
    })
    .filter((d) => d.label || d.value);

  const hrefFor = (kind: ContactKind) => details.find((d) => d.kind === kind && d.href)?.href ?? "";
  const email = details.find((d) => d.kind === "email")?.value ?? "";

  const buttons: ContactLink[] = list(acf.contact_buttons)
    .map((b) => {
      const rawLabel = text(str(b.contact_button));
      const kind = contactKind(rawLabel);
      // Empty button URLs reuse the matching contact detail; a booking button falls back to email.
      const href =
        str(b.contact_button_url).trim() ||
        (kind === "booking"
          ? email
            ? `mailto:${email}?subject=${encodeURIComponent("Discovery call")}`
            : ""
          : hrefFor(kind)) ||
        "#contact";
      return {
        kind,
        label: tidyLabel(rawLabel, kind),
        value: "",
        href,
        external: /^https?:/i.test(href),
        image: null,
      };
    })
    .filter((b) => b.label);

  if (!title && !description && !details.length && !buttons.length) return null;
  return {
    title,
    description,
    image: toImage(acf.contact_image),
    buttons,
    details,
    linkedinUrl: hrefFor("linkedin") || buttons.find((b) => b.kind === "linkedin" && b.external)?.href || null,
  };
}

export function normalizeHome(acf: Raw): HomeContent {
  const contact = toContact(acf);
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
      url: url(acf.button_2_2_hero_url, "#results"),
    },
    education: str(acf.education).trim(),
    stats: toStats(acf),
    about: toAbout(acf),
    expertise: toExpertise(acf),
    results: toResults(acf),
    production: toProduction(acf),
    clients: toClients(acf),
    testimonials: toTestimonials(acf),
    stack: toStack(acf),
    credentials: toCredentials(acf),
    process: toProcess(acf),
    contact,
    // Floating chat button: explicit field first, otherwise the WhatsApp contact detail.
    whatsappUrl:
      str(acf.whatsapp_url).trim() ||
      contact?.details.find((d) => d.kind === "whatsapp")?.href ||
      contact?.buttons.find((b) => b.kind === "whatsapp")?.href ||
      null,
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

/** A result case plus its neighbours, for /results/[slug]. Null when the slug doesn't exist. */
export async function getResult(slug: string) {
  const content = await getHomePage();
  const cards = content.results?.cards ?? [];
  const index = cards.findIndex((c) => c.slug === slug);
  if (index === -1) return null;
  return {
    content,
    card: cards[index],
    index,
    total: cards.length,
    prev: index > 0 ? cards[index - 1] : null,
    next: index < cards.length - 1 ? cards[index + 1] : null,
  };
}
