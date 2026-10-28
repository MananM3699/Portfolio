import { ArrowDown } from "lucide-react";
import { SectionHeading } from "@/components/ui/primitives";
import { about, profile, quickFacts } from "@/content/site";
import { HomeSection } from "./section";

export function About() {
  return (
    <HomeSection id="about" aria-labelledby="about-title">
      <SectionHeading index="01" eyebrow="About" title="A short introduction" titleId="about-title" />

      <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-8">
        <p className="font-serif text-[clamp(1.6rem,2.6vw,2.25rem)] leading-[1.25] text-pretty text-foreground lg:col-span-8">
          {about}
        </p>

        <div className="lg:col-span-4">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-subtle-foreground">
            Quick facts
          </p>
          <ul className="mt-4 divide-y divide-border border-y border-border">
            {quickFacts.map((fact) => (
              <li key={fact} className="py-3 text-sm text-foreground">
                {fact}
              </li>
            ))}
          </ul>
          <a
            href={profile.resumePath}
            target="_blank"
            rel="noopener"
            className="mt-5 inline-flex items-center gap-1.5 text-sm text-foreground underline decoration-border-strong underline-offset-4 transition-colors hover:text-brand hover:decoration-brand"
          >
            Download resume
            <ArrowDown className="size-3.5" aria-hidden />
            <span className="sr-only">(PDF, opens in a new tab)</span>
          </a>
        </div>
      </div>
    </HomeSection>
  );
}
