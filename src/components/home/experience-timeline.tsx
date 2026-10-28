import { SectionHeading } from "@/components/ui/primitives";
import { education, experience, profile } from "@/content/site";
import { HomeSection } from "./section";

export function ExperienceTimeline() {
  return (
    <HomeSection id="experience" aria-labelledby="experience-title">
      <SectionHeading
        index="05"
        eyebrow="Experience"
        title={`${profile.yearsOfExperience} years, three companies`}
        titleId="experience-title"
      />

      <ol className="mt-14 border-t border-border">
        {experience.map((job) => (
          <li
            key={`${job.company}-${job.period}`}
            className="grid gap-x-8 gap-y-5 border-b border-border py-10 lg:grid-cols-12"
          >
            <div className="lg:col-span-3">
              <p className="font-mono text-xs text-foreground">{job.period}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {job.company} · {job.location}
              </p>
              {job.current && <p className="mt-3 font-mono text-xs text-brand">● Current</p>}
            </div>

            <div className="lg:col-span-9">
              <h3 className="font-serif text-3xl leading-tight text-foreground sm:text-4xl">{job.role}</h3>
              <p className="mt-3 max-w-2xl text-base text-muted-foreground">{job.summary}</p>
              <ul className="mt-6 max-w-3xl space-y-2.5 text-sm leading-relaxed text-muted-foreground">
                {job.highlights.map((item) => (
                  <li key={item} className="grid grid-cols-[1.25rem_minmax(0,1fr)]">
                    <span aria-hidden className="text-subtle-foreground">
                      –
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 font-mono text-xs leading-relaxed text-subtle-foreground">
                {job.stack.join(", ")}
              </p>
            </div>
          </li>
        ))}

        {education.map((e) => (
          <li key={e.title} className="grid gap-x-8 gap-y-2 py-8 lg:grid-cols-12">
            <p className="font-mono text-xs text-foreground lg:col-span-3">{e.period}</p>
            <p className="text-sm text-muted-foreground lg:col-span-9">
              <span className="text-foreground">{e.title}</span> · {e.org}
            </p>
          </li>
        ))}
      </ol>
    </HomeSection>
  );
}
