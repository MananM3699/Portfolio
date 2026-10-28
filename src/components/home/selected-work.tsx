import Link from "next/link";
import { SectionHeading } from "@/components/ui/primitives";
import { caseStudies, type Project } from "@/content/projects";
import { HomeSection, rowLinkClass } from "./section";

export function SelectedWork() {
  return (
    <HomeSection id="work" aria-labelledby="work-title">
      <SectionHeading
        index="02"
        eyebrow="Projects"
        title="Case studies you can click through"
        titleId="work-title"
        description="Two production projects, each with a live demo you can try. The originals are under NDA, so the demos are rebuilt with mock data, but the engineering patterns are the real ones."
      />
      <ol className="mt-14 border-t border-border">
        {caseStudies.map((project, i) => (
          <WorkRow key={project.slug} project={project} index={i + 1} />
        ))}
      </ol>
    </HomeSection>
  );
}

function WorkRow({ project, index }: { project: Project; index: number }) {
  return (
    <li className="group relative grid gap-x-8 gap-y-4 border-b border-border py-10 transition-colors hover:bg-muted/40 sm:px-4 lg:grid-cols-12 lg:py-12">
      <p className="font-mono text-xs text-subtle-foreground lg:col-span-1 lg:pt-3">
        {String(index).padStart(2, "0")}
      </p>

      <div className="lg:col-span-6">
        <h3 className="font-serif text-5xl leading-none text-foreground transition-colors group-hover:text-brand sm:text-6xl">
          <Link href={`/work/${project.slug}`} className={rowLinkClass}>
            {project.title}
          </Link>
        </h3>
        <p className="mt-3 font-mono text-xs text-subtle-foreground">
          {project.org} · {project.period} · {project.domain}
        </p>
        <p className="mt-5 max-w-md font-serif text-2xl leading-snug text-muted-foreground">
          {project.tagline}
        </p>
      </div>

      <div className="lg:col-span-4">
        <p className="text-sm leading-relaxed text-muted-foreground">{project.outcome}</p>
        <p className="mt-4 font-mono text-xs leading-relaxed text-subtle-foreground">
          {project.stack.join(", ")}
        </p>
        <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-subtle-foreground">
          <span>{project.readTime} read</span>
          {project.hasDemo && <span className="text-brand">Live demo</span>}
        </p>
      </div>

      <p
        aria-hidden
        className="font-mono text-xl text-subtle-foreground transition-[color,translate] duration-150 group-hover:translate-x-0.5 group-hover:text-brand lg:col-span-1 lg:text-right"
      >
        ↗
      </p>
    </li>
  );
}
