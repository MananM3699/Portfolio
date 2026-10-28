import { Container } from "@/components/ui/primitives";
import { getProject } from "@/content/projects";

const lines = [
  ["Publishing CMS", "as a modular Nuxt app built on Vue composables and Pinia stores."],
  ["Live fireside chats", "on the Zoom Video SDK, with event-driven messaging between components."],
  ["Session booking", "with Zod validation and date-fns for scheduling logic."],
] as const;

/** One ruled row after the main projects: framework range in Nuxt and Vue. */
export function MoreWork() {
  const accomplishr = getProject("accomplishr");
  return (
    <section aria-labelledby="more-work-title">
      <Container>
        <div className="grid gap-x-8 gap-y-5 border-y border-border py-10 lg:grid-cols-12">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-subtle-foreground lg:col-span-3">
            Also · framework range
          </p>
          <div className="lg:col-span-5">
            <h2 id="more-work-title" className="font-serif text-4xl leading-none text-foreground">
              {accomplishr.title}
            </h2>
            <p className="mt-3 font-mono text-xs text-subtle-foreground">
              {accomplishr.org} · {accomplishr.period} · {accomplishr.domain}
            </p>
            <p className="mt-4 font-serif text-xl leading-snug text-muted-foreground">
              {accomplishr.tagline}
            </p>
          </div>
          <div className="lg:col-span-4">
            <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
              {lines.map(([lead, rest]) => (
                <li key={lead}>
                  <span className="text-foreground">{lead}</span> {rest}
                </li>
              ))}
            </ul>
            <p className="mt-4 font-mono text-xs text-subtle-foreground">{accomplishr.stack.join(", ")}</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
