import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { CaseBody, CaseHero, CaseNav } from "@/components/case-study";
import { FloatingContact } from "@/components/floating-contact";
import { Footer } from "@/components/footer";
import { getHomePage, getResult, type NavItem } from "@/lib/wordpress";

// Pre-render every case that exists at build time. Cases added in WordPress later are rendered
// on first visit (dynamicParams defaults to true) and cached with the same `wp-home` tag, so
// /api/revalidate refreshes them along with the home page.
export async function generateStaticParams() {
  const content = await getHomePage();
  return (content.results?.cards ?? []).map((card) => ({ slug: card.slug }));
}

export async function generateMetadata({ params }: PageProps<"/results/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const result = await getResult(slug);
  if (!result) return { title: "Case not found" };

  const { card, content } = result;
  return {
    title: `${card.title} | ${content.name}`,
    description: card.summary,
    openGraph: {
      title: card.title,
      description: card.summary,
      images: card.image ? [{ url: card.image.url }] : undefined,
    },
  };
}

// On a sub-page, in-page links ("#about") must point back to the home page ("/#about").
const toHomeLinks = (items: NavItem[]) =>
  items.map((item) => (item.url.startsWith("#") ? { ...item, url: `/${item.url}` } : item));

export default async function ResultPage({ params }: PageProps<"/results/[slug]">) {
  const { slug } = await params;
  const result = await getResult(slug);
  if (!result) notFound();

  const { content, card, index, total, prev, next } = result;
  const navItems = toHomeLinks(content.navItems);
  const resultsItem = navItems.find((item) => item.url === "/#results");
  const sectionLabel = resultsItem?.label ?? "Results";
  const backHref = "/#results";
  const navButtonUrl = content.navButton.url.startsWith("#") ? `/${content.navButton.url}` : content.navButton.url;

  return (
    <main id="top" className="min-h-screen bg-transparent">
      <Navbar
        name={content.name}
        navItems={navItems}
        buttonText={content.navButton.text}
        buttonUrl={navButtonUrl}
        activeUrl={resultsItem?.url}
        homeHref="/"
      />

      <article>
        <CaseHero
          card={{ slug: card.slug, title: card.title, summary: card.summary, image: card.image, metrics: card.metrics }}
          number={index + 1}
          total={total}
          sectionLabel={sectionLabel}
          backHref={backHref}
        />
        <CaseBody html={card.body} />
      </article>

      <CaseNav
        prev={prev && { slug: prev.slug, title: prev.title }}
        next={next && { slug: next.slug, title: next.title }}
        backHref={backHref}
        sectionLabel={sectionLabel}
      />

      <Footer name={content.name} linkedinUrl={content.contact?.linkedinUrl} topHref="#top" />
      <FloatingContact url={content.whatsappUrl} />
    </main>
  );
}
