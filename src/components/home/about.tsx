import { ArrowDown, ArrowRight } from "lucide-react";
import { Eyebrow } from "@/components/ui/primitives";
import { about, profile, quickFacts } from "@/content/site";
import { HomeSection } from "./section";

export function About() {
  return (
    <HomeSection id="about" aria-labelledby="about-title">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
        <div>
          <Eyebrow className="flex items-center gap-3">
            <span aria-hidden className="h-px w-8 bg-brand/60" />
            About
          </Eyebrow>
          <h2 id="about-title" className="sr-only">
            About {profile.name}
          </h2>
          <p className="mt-6 text-xl leading-relaxed text-pretty text-foreground/90 sm:text-2xl sm:leading-relaxed">
            {about}
          </p>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-7">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-brand">Quick facts</p>
          <ul className="mt-4 divide-y divide-border">
            {quickFacts.map((fact) => (
              <li key={fact} className="flex items-center gap-3 py-3 font-mono text-sm text-foreground">
                <ArrowRight className="size-3.5 shrink-0 text-brand" aria-hidden />
                {fact}
              </li>
            ))}
          </ul>
          <a
            href={profile.resumePath}
            target="_blank"
            rel="noopener"
            className="mt-5 inline-flex items-center gap-1.5 font-mono text-sm text-brand hover:underline"
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
