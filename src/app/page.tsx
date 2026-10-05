import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/Hero";
import { RevenueCards } from "@/components/revenue-cards";
import { About } from "@/components/about";
import { Expertise } from "@/components/expertise";
import { SectionBreak } from "@/components/section-break";
import { FloatingContact } from "@/components/floating-contact";
import { HashScroll } from "@/components/hash-scroll";
import { getHomePage, type NavItem } from "@/lib/wordpress";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getHomePage();
  return {
    title: `${content.name} | Full Stack Digital Marketer`,
    description: content.description,
  };
}

// Number + label for a section, taken from its position in the WordPress nav.
function sectionMarker(navItems: NavItem[], hash: string) {
  const i = navItems.findIndex((item) => item.url === hash);
  return i === -1 ? undefined : { index: i + 1, label: navItems[i].label };
}

export default async function Home() {
  const content = await getHomePage();
  const about = sectionMarker(content.navItems, "#about");
  const expertise = sectionMarker(content.navItems, "#expertise");

  return (
    <main className="min-h-screen bg-transparent">
      <Navbar
        name={content.name}
        navItems={content.navItems}
        buttonText={content.navButton.text}
        buttonUrl={content.navButton.url}
      />

      {/* "Home" in the nav covers the hero and the revenue cards */}
      <div id="home" className="scroll-mt-24">
        <Hero
          name={content.name}
          roles={content.roles}
          description={content.description}
          primaryCta={content.primaryCta}
          secondaryCta={content.secondaryCta}
          education={content.education}
          heroImage={content.heroImage}
          stats={content.stats}
        />
        <RevenueCards stats={content.stats} />
      </div>

      {content.about && (
        <>
          <SectionBreak />
          <About about={content.about} name={content.name} label={about?.label} index={about?.index} />
        </>
      )}

      {content.expertise && (
        <>
          <SectionBreak />
          <Expertise expertise={content.expertise} label={expertise?.label} index={expertise?.index} />
        </>
      )}

      <FloatingContact url={content.whatsappUrl} />
      <HashScroll />
    </main>
  );
}
