import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/Hero";
import { RevenueCards } from "@/components/revenue-cards";
import { About } from "@/components/about";
import { Expertise } from "@/components/expertise";
import { Results } from "@/components/results";
import { Production } from "@/components/production";
import { Clients } from "@/components/clients";
import { Testimonials } from "@/components/testimonials";
import { Stack } from "@/components/stack";
import { Credentials } from "@/components/credentials";
import { Process } from "@/components/process";
import { Contact } from "@/components/contact";
import { Footer } from "@/components/footer";
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
  const results = sectionMarker(content.navItems, "#results");
  const production = sectionMarker(content.navItems, "#production");
  const clients = sectionMarker(content.navItems, "#clients");
  const stack = sectionMarker(content.navItems, "#stack");
  const credentials = sectionMarker(content.navItems, "#credentials");
  const process = sectionMarker(content.navItems, "#process");
  const contact = sectionMarker(content.navItems, "#contact");

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

      {content.results && (
        <>
          <SectionBreak />
          <Results
            title={content.results.title}
            description={content.results.description}
            // The long case-study body only ships to the detail page.
            cards={content.results.cards.map(({ slug, title, summary, image, metrics }) => ({ slug, title, summary, image, metrics }))}
            label={results?.label}
            index={results?.index}
          />
        </>
      )}

      {content.production && (
        <>
          <SectionBreak />
          <Production production={content.production} label={production?.label} index={production?.index} />
        </>
      )}

      {/* "Clients" in the nav covers the logos and the testimonials */}
      {(content.clients || content.testimonials) && (
        <>
          <SectionBreak />
          <div id="clients" className="scroll-mt-24">
            {content.clients && <Clients clients={content.clients} label={clients?.label} index={clients?.index} />}
            {content.clients && content.testimonials && <SectionBreak />}
            {content.testimonials && <Testimonials testimonials={content.testimonials} />}
          </div>
        </>
      )}

      {content.stack && (
        <>
          <SectionBreak />
          <Stack stack={content.stack} label={stack?.label} index={stack?.index} />
        </>
      )}

      {content.credentials && (
        <>
          <SectionBreak />
          <Credentials credentials={content.credentials} label={credentials?.label} index={credentials?.index} />
        </>
      )}

      {content.process && (
        <>
          <SectionBreak />
          <Process process={content.process} label={process?.label} index={process?.index} />
        </>
      )}

      {content.contact && (
        <>
          <SectionBreak />
          <Contact contact={content.contact} name={content.name} label={contact?.label} index={contact?.index} />
        </>
      )}

      <Footer name={content.name} linkedinUrl={content.contact?.linkedinUrl} />

      <FloatingContact url={content.whatsappUrl} />
      <HashScroll />
    </main>
  );
}
