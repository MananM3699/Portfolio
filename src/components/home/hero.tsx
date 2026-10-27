import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { ButtonLink, Container, buttonClass } from "@/components/ui/primitives";
import { profile } from "@/content/site";
import { CopyEmail } from "./copy-email";
import { HeroPortrait } from "./hero-portrait";
import { SocialLinks } from "./social-links";

export function Hero() {
  return (
    <section aria-labelledby="hero-name" className="relative isolate overflow-hidden">
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 -z-10" />

      <Container className="grid items-center gap-12 pt-14 pb-16 sm:pt-20 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-10 lg:py-16">
        <div className="min-w-0">
          <p className="flex items-center gap-3 font-mono text-xs font-medium uppercase tracking-[0.18em] text-brand">
            <span aria-hidden className="h-px w-8 bg-brand/60" />
            {profile.role} · Frontend architecture
          </p>

          <h1
            id="hero-name"
            className="mt-6 text-[clamp(3.25rem,9vw,6rem)] leading-[0.95] font-bold tracking-[-0.04em] text-foreground"
          >
            {profile.name.split(" ").map((part, i) => (
              <span key={part} className={i > 0 ? "block" : "block sm:inline"}>
                {part}
                {i === 0 && " "}
              </span>
            ))}
          </h1>

          <p className="mt-5 font-mono text-base text-balance sm:text-lg lg:text-xl">
            <span aria-hidden className="text-brand">
              &gt;{" "}
            </span>
            <span className="text-gradient">{profile.tagline}</span>
            <span aria-hidden className="caret ml-0.5 text-brand">
              _
            </span>
          </p>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">
            {profile.summary}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <ButtonLink href="/#work" className="h-11 px-5">
              View projects
              <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
            <a
              href={profile.resumePath}
              target="_blank"
              rel="noopener"
              className={buttonClass("secondary", "h-11 px-5")}
            >
              Resume
              <ArrowDown className="size-4" aria-hidden />
              <span className="sr-only">(PDF, opens in a new tab)</span>
            </a>
            <Link
              href="/work/hrms#demo"
              className="ml-1 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
            >
              or try the live permission demo
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:flex-wrap sm:items-center">
            <CopyEmail email={profile.email} />
            <div className="flex flex-wrap items-center gap-1">
              <SocialLinks />
            </div>
          </div>
        </div>

        <HeroPortrait />
      </Container>
    </section>
  );
}
