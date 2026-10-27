import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { getAdjacentProjects, type Project } from "@/content/projects";
import { cn } from "@/lib/utils";
import { Chip, Container, Eyebrow } from "../ui/primitives";
import { TableOfContents, type TocItem } from "./table-of-contents";

/**
 * Page shell for /work/[slug]: header + TL;DR, a sticky TOC rail on desktop,
 * and prev/next navigation. Pages compose <CaseSection>, <Decision>, <Figure>
 * and <DemoFrame> inside it.
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
      <header className="relative">
        <Container className="py-14 sm:py-20">
          <Link
            href="/#work"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden /> All work
          </Link>
          <Eyebrow className="mt-8">
            {project.domain} · {project.org} · {project.period}
          </Eyebrow>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {project.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {project.tagline}
          </p>
          <dl className="glass mt-10 grid overflow-hidden rounded-2xl sm:grid-cols-2 lg:grid-cols-4 [&>div]:border-border sm:[&>div:nth-child(odd)]:border-r lg:[&>div]:border-r lg:[&>div:last-child]:border-r-0 [&>div]:border-b sm:[&>div:nth-last-child(-n+2)]:border-b-0 [&>div:last-child]:border-b-0">
            {tldr.map((item) => (
              <div key={item.label} className="p-4">
                <dt className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-subtle-foreground">
                  {item.label}
                </dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-foreground">{item.value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 flex flex-wrap gap-1.5">
            {project.stack.map((s) => (
              <Chip key={s}>{s}</Chip>
            ))}
          </div>
        </Container>
      </header>

      <Container className="grid gap-12 py-14 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-16">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <TableOfContents items={toc} />
          </div>
        </aside>
        <div className="min-w-0 space-y-20">{children}</div>
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
  eyebrow?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24">
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2
        id={`${id}-title`}
        className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
      >
        {title}
      </h2>
      <div className="mt-6 space-y-8">{children}</div>
    </section>
  );
}

/** Long-form text column, capped at a readable measure. */
export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("prose-case max-w-[68ch]", className)}>{children}</div>;
}

/**
 * The recurring "decision record": what was chosen, what was rejected and why.
 * Gives reviewers one consistent pattern to scan in every case study.
 */
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
    <div className="glass max-w-[68ch] rounded-2xl">
      <div className="flex items-baseline gap-3 border-b border-border px-5 py-4">
        <span className="font-mono text-xs text-brand">DECISION {String(n).padStart(2, "0")}</span>
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      <div className="space-y-4 px-5 py-5 text-[0.95rem] leading-relaxed text-muted-foreground">
        <p>{context}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-success-soft p-3.5">
            <p className="flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-success">
              <Check className="size-3.5" aria-hidden /> Chose
            </p>
            <div className="mt-1.5 text-foreground">{chose}</div>
          </div>
          <div className="glass-subtle rounded-xl p-3.5">
            <p className="flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-subtle-foreground">
              <X className="size-3.5" aria-hidden /> Rejected
            </p>
            <div className="mt-1.5">{rejected}</div>
          </div>
        </div>
        <p>
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-foreground">
            Trade-off ·{" "}
          </span>
          {why}
        </p>
      </div>
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
      <div className="glass overflow-x-auto rounded-2xl p-4 sm:p-6">{children}</div>
      {caption && (
        <figcaption className="mt-3 text-sm text-subtle-foreground">{caption}</figcaption>
      )}
    </figure>
  );
}

/**
 * "App window" chrome around an interactive demo, with the mandatory mock-data label
 * (the originals are proprietary).
 */
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
    <div
      className={cn(
        "glass overflow-hidden rounded-2xl",
        className,
      )}
    >
      <div className="flex items-center gap-3 border-b border-border bg-muted/60 px-4 py-2.5">
        <div className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-[#ff5f57]/80" />
          <span className="size-2.5 rounded-full bg-[#febc2e]/80" />
          <span className="size-2.5 rounded-full bg-[#28c840]/80" />
        </div>
        <p className="truncate font-mono text-xs text-muted-foreground">{title}</p>
        <span className="ml-auto hidden shrink-0 rounded-md bg-warning-soft px-2 py-0.5 font-mono text-[0.65rem] text-warning sm:inline">
          {note}
        </span>
      </div>
      <div>{children}</div>
      <p className="border-t border-border bg-muted/60 px-4 py-2 font-mono text-[0.65rem] text-warning sm:hidden">
        {note}
      </p>
    </div>
  );
}

/** Placeholder shown while a lazy demo chunk loads; keeps layout from jumping. */
export function DemoSkeleton({ height = 480, label = "Loading demo…" }: { height?: number; label?: string }) {
  return (
    <div
      className="glass flex animate-pulse items-center justify-center rounded-2xl font-mono text-xs text-subtle-foreground"
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
    <Container>
      <nav
        aria-label="More case studies"
        className="grid gap-4 border-t border-border pt-10 sm:grid-cols-2"
      >
        {prev ? (
          <Link href={`/work/${prev.slug}`} className="glass group rounded-2xl p-5 transition-transform hover:-translate-y-0.5">
            <span className="flex items-center gap-1.5 text-xs text-subtle-foreground">
              <ArrowLeft className="size-3.5" aria-hidden /> Previous
            </span>
            <span className="mt-1 block font-medium text-foreground">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            href={`/work/${next.slug}`}
            className="glass group rounded-2xl p-5 text-right transition-transform hover:-translate-y-0.5"
          >
            <span className="flex items-center justify-end gap-1.5 text-xs text-subtle-foreground">
              Next <ArrowRight className="size-3.5" aria-hidden />
            </span>
            <span className="mt-1 block font-medium text-foreground">{next.title}</span>
          </Link>
        )}
      </nav>
    </Container>
  );
}
