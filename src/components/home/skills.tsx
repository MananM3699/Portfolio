import { Card, Chip, SectionHeading } from "@/components/ui/primitives";
import { skillTiers } from "@/content/site";
import { cn } from "@/lib/cn";
import { HomeSection } from "./section";

export function Skills() {
  const [daily, shipped, worked] = skillTiers;
  return (
    <HomeSection id="skills" aria-label="Skills">
      <SectionHeading
        eyebrow="Skills"
        title="Grouped by how often I use them"
        description="Not a logo wall. The first group is what I work in every day."
      />

      {/* The daily tier carries a brand-tinted edge and glow so it reads as the primary group. */}
      <Card className="relative mt-12 overflow-hidden p-6 outline outline-1 -outline-offset-1 outline-brand/35 sm:p-8">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand to-transparent"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-48 w-2/3 -translate-x-1/2 rounded-full bg-brand/15 blur-3xl"
        />
        <div className="relative">
          <TierHeader tier={daily.tier} note={daily.note} strong />
          <ul className="mt-5 flex flex-wrap gap-2" aria-label={`${daily.tier} skills`}>
            {daily.items.map((item) => (
              <li key={item}>
                <Chip className="px-2.5 py-1 text-[0.8rem] text-foreground">{item}</Chip>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      <div className="mt-5 grid gap-5 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Card className="p-6">
          <TierHeader tier={shipped.tier} note={shipped.note} />
          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label={`${shipped.tier} skills`}>
            {shipped.items.map((item) => (
              <li key={item}>
                <Chip>{item}</Chip>
              </li>
            ))}
          </ul>
        </Card>
        <div className="glass-subtle rounded-2xl p-6">
          <TierHeader tier={worked.tier} note={worked.note} />
          <ul
            className="mt-4 flex flex-wrap gap-x-3 gap-y-1.5 font-mono text-[0.75rem] text-muted-foreground"
            aria-label={`${worked.tier} skills`}
          >
            {worked.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </HomeSection>
  );
}

function TierHeader({ tier, note, strong = false }: { tier: string; note: string; strong?: boolean }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <h3
        className={cn(
          "flex items-center gap-2 font-semibold tracking-tight text-foreground",
          strong ? "text-xl" : "text-base",
        )}
      >
        {strong && <span className="size-2 rounded-full bg-brand" aria-hidden />}
        {tier}
      </h3>
      <p className="text-sm text-muted-foreground">{note}</p>
    </div>
  );
}
