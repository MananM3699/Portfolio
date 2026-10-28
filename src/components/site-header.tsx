import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { profile } from "@/content/site";
import { Container, buttonClass } from "./ui/primitives";

/** Solid bar: the mark and name on the left; the work and the one primary action on the right. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <Container className="flex h-16 items-center justify-between gap-3 sm:gap-6">
        <Link href="/" aria-label={`${profile.name}, home`} className="group flex min-w-0 items-center gap-3">
          <span
            aria-hidden
            className="flex size-8 shrink-0 items-center justify-center rounded-md bg-brand font-serif text-base font-bold leading-none text-brand-foreground"
          >
            M
          </span>
          <span className="hidden truncate text-base font-medium tracking-tight text-foreground sm:block">
            {profile.name}
          </span>
        </Link>
        <nav aria-label="Primary" className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Link
            href="/#work"
            className="rounded-md px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
          >
            Projects
          </Link>
          <Link href="/contact" className={buttonClass("primary", "h-9 gap-1 px-3 sm:px-4")}>
            Get in touch
            <ArrowUpRight className="hidden size-4 sm:block" aria-hidden />
          </Link>
        </nav>
      </Container>
    </header>
  );
}
