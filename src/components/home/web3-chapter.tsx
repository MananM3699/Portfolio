import { SectionHeading } from "@/components/ui/primitives";
import { getProject } from "@/content/projects";
import { experience } from "@/content/site";
import { HomeSection } from "./section";
import { TxLifecycleDiagram } from "./tx-lifecycle-diagram";

const facts = [
  "6+ wallet providers through RainbowKit and Wagmi.",
  "Real-time transaction tracking from signature to confirmation.",
  "ERC-20 and ERC-721 contracts tested with Hardhat across 800+ testnet transactions; gas costs down 10%.",
];

export function Web3Chapter() {
  const solidify = getProject("solidify");
  const alite = experience.find((e) => e.company === "Alite Projects");

  return (
    <HomeSection id="web3" aria-labelledby="web3-title">
      <SectionHeading
        index="03"
        eyebrow={`Earlier chapter · ${solidify.period.replace(" – ", "–")}`}
        title="Designing UI for irreversible actions"
        titleId="web3-title"
      />

      <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-8">
        <p className="max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground lg:col-span-5">
          A signed transaction can&apos;t be undone, so every state between &ldquo;click&rdquo; and
          &ldquo;confirmed&rdquo; has to be visible and named. In {solidify.title}, a{" "}
          {solidify.stack[0]} dApp at {solidify.org}, I built the ICO, governance-token and airdrop
          flows and contributed to the contracts and their Hardhat tests.
        </p>

        <div className="lg:col-span-6 lg:col-start-7">
          <ul className="divide-y divide-border border-y border-border">
            {facts.map((fact) => (
              <li key={fact} className="py-4 text-sm leading-relaxed text-foreground">
                {fact}
              </li>
            ))}
          </ul>
          {alite && (
            <p className="mt-4 font-mono text-xs leading-relaxed text-subtle-foreground">
              {alite.stack.join(", ")}
            </p>
          )}
        </div>
      </div>

      <figure className="mt-16 min-w-0">
        <div className="overflow-x-auto border border-border p-4 sm:p-8">
          <TxLifecycleDiagram />
        </div>
        <figcaption className="mt-3 font-mono text-xs leading-relaxed text-subtle-foreground">
          The transaction states the UI had to render. Solid arrows are the happy path; dashed arrows
          are the exits. Double borders mark end states.
        </figcaption>
      </figure>
    </HomeSection>
  );
}
