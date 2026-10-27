import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { Card, Chip, SectionHeading } from "@/components/ui/primitives";
import { caseStudies, type Project } from "@/content/projects";
import { cn } from "@/lib/cn";
import { HomeSection, stretchedCardClass, stretchedLinkClass } from "./section";

export function SelectedWork() {
  const [lead, ...rest] = caseStudies;
  return (
    <HomeSection id="work">
      <SectionHeading
        eyebrow="Projects"
        title="Case studies you can click through"
        description="Two production projects, each with a live demo you can try. The originals are under NDA, so the demos are rebuilt with mock data, but the engineering patterns are the real ones."
      />
      <div className="mt-12 grid gap-5 lg:grid-cols-5">
        {lead && <WorkCard project={lead} lead className="lg:col-span-3" />}
        {rest.map((project) => (
          <WorkCard key={project.slug} project={project} className="lg:col-span-2" />
        ))}
      </div>
    </HomeSection>
  );
}

function WorkCard({
  project,
  lead = false,
  className,
}: {
  project: Project;
  lead?: boolean;
  className?: string;
}) {
  return (
    <Card className={cn(stretchedCardClass, "flex flex-col p-6 sm:p-8", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Chip>{project.domain}</Chip>
        {project.hasDemo && (
          <Chip tone="accent">
            <span className="size-1.5 rounded-full bg-brand" aria-hidden />
            Live demo
          </Chip>
        )}
        <span className="ml-auto inline-flex items-center gap-1 font-mono text-xs text-muted-foreground">
          <Clock className="size-3.5" aria-hidden />
          {project.readTime} read
        </span>
      </div>

      <h3
        className={cn(
          "mt-6 font-semibold tracking-tight text-foreground",
          lead ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl",
        )}
      >
        <Link href={`/work/${project.slug}`} className={stretchedLinkClass}>
          {project.title}
          <span className="sr-only"> case study</span>
        </Link>
      </h3>
      <p className="mt-1 font-mono text-xs text-muted-foreground">
        {project.org} · {project.period}
      </p>
      <p
        className={cn(
          "mt-4 leading-relaxed text-foreground",
          lead ? "text-lg sm:text-xl" : "text-base sm:text-lg",
        )}
      >
        {project.tagline}
      </p>

      {lead && <RolePreview />}

      <dl className="mt-6 space-y-4 text-sm">
        <div>
          <dt className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-subtle-foreground">
            Outcome
          </dt>
          <dd className="mt-1 leading-relaxed text-muted-foreground">{project.outcome}</dd>
        </div>
        <div>
          <dt className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-subtle-foreground">
            Role
          </dt>
          <dd className="mt-1 leading-relaxed text-muted-foreground">{project.role}</dd>
        </div>
      </dl>

      <ul className="mt-6 flex flex-wrap gap-1.5" aria-label={`${project.title} stack`}>
        {project.stack.map((item) => (
          <li key={item}>
            <Chip>{item}</Chip>
          </li>
        ))}
      </ul>

      <span
        aria-hidden
        className="mt-auto inline-flex items-center gap-1.5 pt-8 text-sm font-medium text-brand"
      >
        Read case study
        <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      </span>
    </Card>
  );
}

/** Static hint at the signature demo on the HRMS case study. Decorative only, so it mirrors the
 * look of the shadcn ToggleGroup (outline, sm, spacing 0) with plain spans instead of buttons. */
function RolePreview() {
  const roles = ["Employee", "Manager", "HR Admin"];
  return (
    <div
      aria-hidden
      className="glass-subtle mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl px-3 py-3"
    >
      <span className="font-mono text-[0.72rem] text-muted-foreground">View as</span>
      <span
        data-slot="toggle-group"
        className="flex w-fit items-center rounded-lg bg-background/60 shadow-xs dark:bg-background/40"
      >
        {roles.map((role, i) => (
          <span
            key={role}
            data-state={i === 1 ? "on" : "off"}
            className={cn(
              "inline-flex h-7 items-center justify-center border border-input px-2.5 text-[0.8rem] font-medium whitespace-nowrap",
              i > 0 && "border-l-0",
              i === 0 && "rounded-l-lg",
              i === roles.length - 1 && "rounded-r-lg",
              i === 1 ? "bg-brand-soft text-brand" : "text-muted-foreground",
            )}
          >
            {role}
          </span>
        ))}
      </span>
      <span className="basis-full text-xs leading-relaxed text-muted-foreground sm:basis-auto sm:flex-1">
        Switch roles and the screen re-renders with that role&apos;s permissions.
      </span>
    </div>
  );
}
