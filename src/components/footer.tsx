import Link from "next/link";

type FooterProps = {
  name: string;
  /** Shown after the name, e.g. "Full Stack Digital Marketer". */
  role?: string;
  linkedinUrl?: string | null;
  /** Where "Back to top" goes: "#home" on the home page, "/" elsewhere. */
  topHref?: string;
};

const linkClass =
  "relative transition-colors duration-300 hover:text-foreground after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-brand after:transition-transform after:duration-300 hover:after:scale-x-100";

/** Site footer: copyright on the left, LinkedIn and "Back to top" on the right. */
export function Footer({ name, role = "Full Stack Digital Marketer", linkedinUrl, topHref = "#home" }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-8 w-full border-t border-border">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between md:px-12 md:py-10 lg:px-20">
        <p>
          &copy; {year} {name}
          {role && <span> &middot; {role}</span>}
        </p>
        <nav aria-label="Footer" className="flex items-center gap-6">
          {linkedinUrl && (
            <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
              LinkedIn
            </a>
          )}
          <Link href={topHref} className={linkClass}>
            Back to top
          </Link>
        </nav>
      </div>
    </footer>
  );
}
