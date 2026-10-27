import { skillTiers } from "@/content/site";
import { cn } from "@/lib/utils";

const rows: { items: string[]; duration: string; reverse?: boolean }[] = [
  {
    items: ["React", "TypeScript", "Next.js", "Redux Toolkit", "RTK Query", "React Hook Form", "Zod", "Tailwind CSS", "shadcn/ui", "Vue / Nuxt", "Pinia", "FullCalendar"],
    duration: "70s",
  },
  {
    items: ["Node.js", "Express", "MongoDB", "Mongoose", "PostgreSQL", "REST APIs", "JWT + RBAC", "Server-Sent Events", "IndexedDB", "AWS EC2 / S3", "Docker", "Plotly"],
    duration: "80s",
    reverse: true,
  },
  {
    items: ["Solidity", "Hardhat", "Ethers.js", "Wagmi", "RainbowKit", "OpenZeppelin", "GitHub Spec Kit", "Claude", "OpenAI", "Groq", "n8n", "React-Leaflet"],
    duration: "75s",
  },
];

// Highlight what's used daily so the wall still says something.
const daily = new Set<string>(skillTiers[0].items);

/** Three slow, alternating rows of the stack; hovering a name lights it up without pausing the
 * rows. Decorative: the same list is in Skills. */
export function TechMarquee() {
  return (
    <section aria-label="Tech stack" className="marquee relative border-y border-border py-6">
      <p className="sr-only">
        Tech stack: {rows.flatMap((r) => r.items).join(", ")}.
      </p>
      <div
        aria-hidden
        className="space-y-3 overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]"
      >
        {rows.map((row, r) => (
          <div
            key={r}
            data-reverse={row.reverse ? "" : undefined}
            className="marquee-track flex w-max"
            style={{ ["--marquee-duration" as string]: row.duration }}
          >
            {[0, 1].map((copy) => (
              <ul key={copy} className="flex shrink-0 items-center">
                {row.items.map((item) => (
                  <li key={item} className="flex items-center">
                    <span
                      className={cn(
                        "cursor-default px-5 font-mono text-xl whitespace-nowrap transition-[color,text-shadow] duration-200 hover:text-foreground hover:[text-shadow:0_0_14px_var(--brand),0_0_32px_var(--brand)] sm:text-2xl",
                        daily.has(item) ? "font-semibold text-brand" : "text-subtle-foreground/70",
                      )}
                    >
                      {item}
                    </span>
                    <span className="text-border-strong">•</span>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
