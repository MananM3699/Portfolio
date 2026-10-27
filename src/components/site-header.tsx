import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { profile } from "@/content/site";
import { Container } from "./ui/primitives";

/** Two destinations only: the work, and the way to start a conversation (the primary action). */
export function SiteHeader() {
  return (
    <header className="glass-bar sticky top-0 z-40">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 font-medium text-foreground">
          <span className="flex size-8 items-center justify-center rounded-xl bg-brand font-mono text-xs font-semibold text-brand-foreground shadow-[0_6px_18px_-6px_var(--brand)]">
            MM
          </span>
          <span className="hidden sm:inline">{profile.name}</span>
        </Link>

        {/* One glass capsule holds both items so they read as a single control. */}
        <nav
          aria-label="Primary"
          className="glass-subtle flex items-center gap-1 rounded-2xl p-1"
        >
          <Link
            href="/#work"
            className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Projects
          </Link>

          <Link
            href="/contact"
            className="group inline-flex h-10 items-center gap-1.5 rounded-xl bg-linear-to-br from-cta-from to-cta-to px-5 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.28),0_6px_16px_-6px_var(--cta-from)] transition-[filter,translate] duration-200 hover:-translate-y-px hover:brightness-110 active:translate-y-0"
          >
            Get in touch
            <ArrowUpRight
              className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden
            />
          </Link>
        </nav>
      </Container>
    </header>
  );
}
