import { Card, Chip, Eyebrow } from "@/components/ui/primitives";
import { getProject } from "@/content/projects";
import { HomeSection } from "./section";

export function MoreWork() {
  const accomplishr = getProject("accomplishr");
  return (
    <HomeSection aria-labelledby="more-work-title" className="py-10 sm:py-12">
      <div className="grid gap-6 md:grid-cols-[14rem_minmax(0,1fr)] md:gap-10">
        <div>
          <Eyebrow>More work</Eyebrow>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Framework range: the same kind of product work in Nuxt and Vue.
          </p>
        </div>
        <Card className="p-6 sm:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 id="more-work-title" className="text-lg font-semibold tracking-tight text-foreground">
              {accomplishr.title}
            </h2>
            <p className="font-mono text-xs text-muted-foreground">
              {accomplishr.org} · {accomplishr.period} · {accomplishr.domain}
            </p>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{accomplishr.tagline}</p>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
            <li>
              <span className="font-medium text-foreground">Publishing CMS</span> as a modular Nuxt
              app built on Vue composables and Pinia stores.
            </li>
            <li>
              <span className="font-medium text-foreground">Live fireside chats</span> on the Zoom
              Video SDK, with event-driven messaging between components.
            </li>
            <li>
              <span className="font-medium text-foreground">Session booking</span> with Zod
              validation and date-fns for scheduling logic.
            </li>
          </ul>
          <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Accomplishr stack">
            {accomplishr.stack.map((item) => (
              <li key={item}>
                <Chip>{item}</Chip>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </HomeSection>
  );
}
