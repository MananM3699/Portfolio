import { SectionHeading } from "@/components/ui/primitives";
import { skillTiers } from "@/content/site";
import { cn } from "@/lib/utils";
import { HomeSection } from "./section";

export function Skills() {
  return (
    <HomeSection id="skills" aria-labelledby="skills-title">
      <SectionHeading
        index="06"
        eyebrow="Skills"
        title="Grouped by how often I use them"
        titleId="skills-title"
        description="Not a logo wall. The first group is what I work in every day."
      />

      <div className="mt-14 grid border-t border-border lg:grid-cols-3">
        {skillTiers.map((tier, i) => (
          <section
            key={tier.tier}
            aria-label={tier.tier}
            className={cn(
              "border-b border-border py-8 lg:border-b-0 lg:px-8 lg:first:pl-0 lg:last:pr-0",
              i > 0 && "lg:border-l",
            )}
          >
            <h3 className="font-serif text-3xl leading-none text-foreground">{tier.tier}</h3>
            <p className="mt-2 text-sm text-subtle-foreground">{tier.note}</p>
            <ul className="mt-6 space-y-1.5 font-mono text-[0.8rem] leading-relaxed">
              {tier.items.map((item) => (
                <li key={item} className={i === 0 ? "text-foreground" : "text-muted-foreground"}>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </HomeSection>
  );
}
