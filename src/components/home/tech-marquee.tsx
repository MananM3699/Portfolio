import { skillTiers } from "@/content/site";
import { cn } from "@/lib/utils";

const items = [
  "React", "TypeScript", "Next.js", "Redux Toolkit", "RTK Query", "Zod", "Tailwind CSS", "shadcn/ui",
  "Node.js", "Express", "MongoDB", "PostgreSQL", "AWS", "Server-Sent Events", "Vue / Nuxt",
  "Solidity", "Hardhat", "Wagmi", "GitHub Spec Kit",
];

const daily = new Set<string>(skillTiers[0].items);

/** One slow, thin strip between the hero and About. Decorative: the full list is in Skills. */
export function TechMarquee() {
  return (
    <section aria-label="Tech stack" className="marquee border-y border-border py-4">
      <p className="sr-only">Tech stack: {items.join(", ")}.</p>
      <div
        aria-hidden
        className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]"
      >
        <div className="marquee-track flex w-max" style={{ ["--marquee-duration" as string]: "70s" }}>
          {[0, 1].map((copy) => (
            <ul key={copy} className="flex shrink-0 items-center">
              {items.map((item) => (
                <li key={item} className="flex items-center">
                  <span
                    className={cn(
                      "px-5 font-mono text-sm whitespace-nowrap",
                      daily.has(item) ? "text-foreground" : "text-subtle-foreground",
                    )}
                  >
                    {item}
                  </span>
                  <span className="text-border-strong">/</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
