import { ArrowDown, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Container, buttonClass } from "@/components/ui/primitives";
import { profile } from "@/content/site";
import { CopyEmail } from "./copy-email";
import { HeroPortrait } from "./hero-portrait";
import { SocialLinks } from "./social-links";

export function Hero() {
  return (
    <section aria-labelledby="hero-name" className="pt-12 pb-16 sm:pt-16 sm:pb-24">
      <Container className="grid items-center gap-10 lg:grid-cols-12 lg:gap-6">
        <div className="min-w-0 lg:col-span-7">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-subtle-foreground">
            {profile.role} · {profile.company} · {profile.location}
          </p>

          <h1
            id="hero-name"
            className="mt-8 font-serif text-[clamp(3.5rem,9vw,8rem)] leading-[0.9] tracking-[-0.03em] text-foreground"
          >
            {profile.name.split(" ").map((part) => (
              <span key={part} className="block">
                {part}
              </span>
            ))}
          </h1>

          <p className="mt-7 max-w-xl text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">
            {profile.summary}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href="/#work" className={buttonClass("primary", "h-11 px-5")}>
              View projects
              <ArrowRight className="size-4" aria-hidden />
            </Link>
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
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-8">
            <CopyEmail email={profile.email} />
            <SocialLinks />
          </div>
        </div>

        <div className="lg:col-span-5">
          <HeroPortrait />
        </div>
      </Container>
    </section>
  );
}
