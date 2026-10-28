import Link from "next/link";
import type { ReactNode } from "react";
import { getAdjacentProjects, type Project } from "@/content/projects";
import { cn } from "@/lib/utils";
import { Container } from "../ui/primitives";
import { TableOfContents, type TocItem } from "./table-of-contents";

const mono = "font-mono text-[0.7rem] uppercase tracking-[0.14em] text-subtle-foreground";

/**
 * Editorial article shell for /work/[slug]: title block, a ruled TL;DR, a sticky numbered
 * contents column and a readable article column. Pages compose <CaseSection>, <Decision>,
 * <Figure> and <DemoFrame> inside it.
 */
export function CaseStudyShell({
  project,
  toc,
  tldr,
  children,
}: {
  project: Project;
  toc: TocItem[];
  tldr: { label: string; value: ReactNode }[];
  children: ReactNode;
}) {
  return (
    <article>
      <header className="pt-12 pb-16 sm:pt-16">
        <Container>
          <Link href="/#work" className="font-mono text-xs text-subtle-foreground transition-colors hover:text-brand">
            ← All projects
          </Link>
          <p className={cn(mono, "mt-12")}>
            {project.domain} · {project.org} · {project.period}
          </p>
          <h1 className="mt-5 font-serif text-[clamp(4rem,11vw,8.5rem)] leading-[0.9] tracking-[-0.03em] text-foreground">
            {project.title}
          </h1>
          <p className="mt-6 max-w-2xl font-serif text-[clamp(1.5rem,3vw,2.25rem)] leading-tight text-muted-foreground">
            {project.tagline}
          </p>

          <dl className="mt-14 grid border-y border-border sm:grid-cols-2 lg:grid-cols-4">
            {tldr.map((item, i) => (
              <div
                key={item.label}
                className={cn(
                  "border-b border-border py-5 last:border-b-0 sm:px-5 lg:border-b-0",
                  i === 0 && "sm:pl-0",
                  i > 0 && "lg:border-l",
                  i % 2 === 1 && "sm:border-l lg:border-l",
                )}
              >
                <dt className={mono}>{item.label}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-foreground">{item.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 font-mono text-xs leading-relaxed text-subtle-foreground">{project.stack.join(", ")}</p>
        </Container>
      </header>

      <Container className="grid gap-12 pb-8 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-16">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <TableOfContents items={toc} />
          </div>
        </aside>
        <div className="min-w-0 space-y-24">{children}</div>
      </Container>

      <CaseStudyPager slug={project.slug} />
    </article>
  );
}

export function CaseSection({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  /** "01 · Overview": the number and label are split on the middle dot. */
  eyebrow?: string;
  title: string;
  children: ReactNode;
}) {
  const [num, ...rest] = (eyebrow ?? "").split(" · ");
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 border-t border-border-strong pt-4">
      {eyebrow && (
        <p className="flex items-baseline gap-3 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-subtle-foreground">
          {rest.length > 0 ? (
            <>
              <span className="text-brand">{num}</span>
              <span>{rest.join(" · ")}</span>
            </>
          ) : (
            <span>{eyebrow}</span>
          )}
        </p>
      )}
      <h2 id={`${id}-title`} className="mt-6 max-w-3xl font-serif text-4xl leading-[1.05] text-balance text-foreground sm:text-5xl">
        {title}
      </h2>
      <div className="mt-8 space-y-10">{children}</div>
    </section>
  );
}

/** Long-form text column, capped at a readable measure. */
export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("prose-case max-w-[68ch]", className)}>{children}</div>;
}

/** A decision record: what was chosen, what was rejected, and the trade-off. Text first, ruled. */
export function Decision({
  n,
  title,
  context,
  chose,
  rejected,
  why,
}: {
  n: number;
  title: string;
  context: ReactNode;
  chose: ReactNode;
  rejected: ReactNode;
  why: ReactNode;
}) {
  return (
    <div className="max-w-3xl border-t border-border pt-5">
      <p className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-subtle-foreground">
        Decision <span className="text-brand">{String(n).padStart(2, "0")}</span>
      </p>
      <h3 className="mt-3 font-serif text-3xl leading-tight text-foreground">{title}</h3>
      <p className="mt-4 max-w-[68ch] leading-relaxed text-muted-foreground">{context}</p>
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-brand">Chose</p>
          <div className="mt-2 text-sm leading-relaxed text-foreground">{chose}</div>
        </div>
        <div>
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-subtle-foreground">Rejected</p>
          <div className="mt-2 text-sm leading-relaxed text-muted-foreground">{rejected}</div>
        </div>
      </div>
      <p className="mt-6 max-w-[68ch] text-sm leading-relaxed text-muted-foreground">
        <span className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-foreground">Trade-off · </span>
        {why}
      </p>
    </div>
  );
}

export function Figure({
  caption,
  children,
  className,
}: {
  caption?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <figure className={className}>
      <div className="overflow-x-auto border border-border p-4 sm:p-6">{children}</div>
      {caption && <figcaption className="mt-3 font-mono text-xs leading-relaxed text-subtle-foreground">{caption}</figcaption>}
    </figure>
  );
}

/** Flat frame around an interactive demo: a thin top bar with the title and the mock-data note. */
export function DemoFrame({
  title,
  note = "Recreated demo · mock data · original is proprietary",
  children,
  className,
}: {
  title: string;
  note?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-lg border border-border-strong bg-card", className)}>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b border-border px-4 py-2.5 font-mono text-[0.7rem] text-subtle-foreground">
        <span className="text-foreground">{title}</span>
        <span>{note}</span>
      </div>
      <div>{children}</div>
    </div>
  );
}

/** Placeholder shown while a lazy demo chunk loads; keeps layout from jumping. */
export function DemoSkeleton({ height = 480, label = "Loading demo…" }: { height?: number; label?: string }) {
  return (
    <div
      className="flex items-center justify-center rounded-lg border border-border bg-surface font-mono text-xs text-subtle-foreground"
      style={{ height }}
      role="status"
    >
      {label}
    </div>
  );
}

function CaseStudyPager({ slug }: { slug: Project["slug"] }) {
  const { prev, next } = getAdjacentProjects(slug);
  return (
    <Container className="mt-24">
      <nav aria-label="More case studies" className="grid border-y border-border sm:grid-cols-2">
        {prev ? (
          <Link href={`/work/${prev.slug}`} className="group py-8 transition-colors hover:bg-muted/40 sm:pr-8">
            <span className="font-mono text-xs text-subtle-foreground">← Previous</span>
            <span className="mt-2 block font-serif text-4xl text-foreground transition-colors group-hover:text-brand">
              {prev.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            href={`/work/${next.slug}`}
            className="group py-8 transition-colors hover:bg-muted/40 sm:border-l sm:border-border sm:pl-8 sm:text-right"
          >
            <span className="font-mono text-xs text-subtle-foreground">Next →</span>
            <span className="mt-2 block font-serif text-4xl text-foreground transition-colors group-hover:text-brand">
              {next.title}
            </span>
          </Link>
        )}
      </nav>
    </Container>
  );
}
