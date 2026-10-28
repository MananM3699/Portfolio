import Link from "next/link";
import { Container } from "@/components/ui/primitives";
import { proofPoints } from "@/content/site";

type Evidence = { href: string; label: string };
type EvidenceFor<T extends readonly unknown[]> = { [K in keyof T]: Evidence };

// One entry per proof point, in the same order. The mapped tuple type makes the compiler flag a
// mismatch if proofPoints gains or loses an entry.
const evidence: EvidenceFor<typeof proofPoints> = [
  { href: "/work/hrms", label: "HRMS case study" },
  { href: "/#experience", label: "Helios Solutions" },
  { href: "/work/solbi", label: "SolBI case study" },
  { href: "/#web3", label: "Web3 chapter" },
];

/** Four figures in one ruled row: large serif number, one line of context, one link. */
export function ProofBar() {
  return (
    <section aria-label="Proof points">
      <Container>
        <ul className="grid grid-cols-1 border-y border-border sm:grid-cols-2 lg:grid-cols-4">
          {proofPoints.map((point, i) => (
            <li
              key={point.label}
              className="border-b border-border py-8 last:border-b-0 sm:px-6 sm:first:pl-0 sm:nth-last-[-n+2]:border-b-0 sm:nth-[2n]:border-l lg:border-b-0 lg:nth-[n+2]:border-l lg:first:pl-0"
            >
              <p className="font-serif text-6xl leading-none tabular-nums text-foreground">{point.value}</p>
              <p className="mt-4 max-w-[16rem] text-sm leading-relaxed text-muted-foreground">{point.label}</p>
              <Link
                href={evidence[i].href}
                className="mt-4 inline-block font-mono text-xs text-subtle-foreground transition-colors hover:text-brand"
              >
                {evidence[i].label} ↗
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
