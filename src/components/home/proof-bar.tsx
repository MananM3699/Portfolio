import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/primitives";
import { proofPoints } from "@/content/site";
import { cn } from "@/lib/cn";
import { glassHoverClass } from "./section";

type Evidence = { href: string; label: string };
type EvidenceFor<T extends readonly unknown[]> = { [K in keyof T]: Evidence };

// One entry per proof point, in the same order. The mapped tuple type makes the
// compiler flag a mismatch if proofPoints gains or loses an entry.
const evidence: EvidenceFor<typeof proofPoints> = [
  { href: "/work/hrms", label: "HRMS case study" },
  { href: "#experience", label: "Helios Solutions experience" },
  { href: "/work/solbi", label: "SolBI case study" },
  { href: "#web3", label: "Web3 chapter" },
];

export function ProofBar() {
  return (
    <section aria-label="Proof points" className="pb-4 sm:pb-6">
      <Container>
        <ul className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-4">
          {proofPoints.map((point, i) => {
            const target = evidence[i];
            const isHash = target.href.startsWith("#");
            const content = (
              <>
                <span className="block font-mono text-4xl font-medium tracking-tight text-foreground sm:text-[2.6rem] sm:leading-none">
                  {point.value}
                </span>
                <span className="mt-3 block text-sm leading-snug text-muted-foreground">
                  {point.label}
                </span>
                <span className="mt-auto inline-flex items-center gap-1 pt-5 font-mono text-[0.72rem] text-muted-foreground transition-colors duration-150 group-hover:text-brand">
                  {target.label}
                  <ArrowUpRight
                    className="size-3 transition-transform duration-200 group-hover:-translate-y-px group-hover:translate-x-px"
                    aria-hidden
                  />
                </span>
              </>
            );
            const cls = cn(
              "glass group flex h-full flex-col rounded-2xl p-5 sm:p-6",
              glassHoverClass,
            );
            return (
              <li key={point.label}>
                {isHash ? (
                  <a href={target.href} className={cls}>
                    {content}
                  </a>
                ) : (
                  <Link href={target.href} className={cls}>
                    {content}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
