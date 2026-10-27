import { Card, Chip, SectionHeading } from "@/components/ui/primitives";
import { Separator } from "@/components/ui/separator";
import { education, experience, profile } from "@/content/site";
import { cn } from "@/lib/cn";
import { HomeSection } from "./section";

export function ExperienceTimeline() {
  return (
    <HomeSection id="experience">
      <SectionHeading eyebrow="Experience" title={`${profile.yearsOfExperience} years, three companies`} />

      <Card className="mt-12 max-w-4xl p-6 sm:p-8 lg:p-10">
        <ol>
          {experience.map((job, i) => {
            const last = i === experience.length - 1;
            return (
              <li
                key={`${job.company}-${job.period}`}
                className="relative grid grid-cols-[1.25rem_minmax(0,1fr)] gap-x-4 sm:gap-x-6"
              >
                {/* Rail and node */}
                <div className="relative flex justify-center" aria-hidden>
                  {!last && (
                    <span className="absolute bottom-0 top-7 w-px bg-gradient-to-b from-border-strong to-border" />
                  )}
                  <span
                    className={cn(
                      "relative mt-1.5 size-3 rounded-full border-2",
                      job.current
                        ? "border-brand bg-brand shadow-[0_0_0_4px_var(--brand-soft),0_0_14px_var(--brand)]"
                        : "border-border-strong bg-background",
                    )}
                  />
                </div>

                <article className={cn("min-w-0", last ? "pb-0" : "pb-10 sm:pb-12")}>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h3 className="text-lg font-semibold tracking-tight text-foreground">{job.role}</h3>
                    {job.current && <Chip tone="accent">Current</Chip>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{job.company}</span> · {job.location}
                  </p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">{job.period}</p>
                  <p className="mt-4 text-sm leading-relaxed text-foreground">{job.summary}</p>
                  <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground marker:text-brand/60">
                    {job.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                  <ul className="mt-4 flex flex-wrap gap-1.5" aria-label={`${job.company} stack`}>
                    {job.stack.map((item) => (
                      <li key={item}>
                        <Chip>{item}</Chip>
                      </li>
                    ))}
                  </ul>
                </article>
              </li>
            );
          })}
        </ol>

        <Separator className="mt-10" />
        <p className="pt-6 text-sm text-muted-foreground">
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-brand">Education</span>
          <span className="mx-2 text-border-strong" aria-hidden>
            /
          </span>
          {education.map((e) => `${e.title}, ${e.org}, ${e.period}`).join("; ")}
        </p>
      </Card>
    </HomeSection>
  );
}
