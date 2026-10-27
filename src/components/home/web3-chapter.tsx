import { Card, Chip, Eyebrow } from "@/components/ui/primitives";
import { experience } from "@/content/site";
import { getProject } from "@/content/projects";
import { HomeSection } from "./section";
import { TxLifecycleDiagram } from "./tx-lifecycle-diagram";

export function Web3Chapter() {
  const solidify = getProject("solidify");
  const alite = experience.find((e) => e.company === "Alite Projects");

  return (
    <HomeSection id="web3">
      <Card className="p-5 sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-14">
          <div>
            <Eyebrow>
              {solidify.period.replace(" – ", "–")} · Web3 at {solidify.org}
            </Eyebrow>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Designing UI for irreversible actions
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              A signed transaction can&apos;t be undone, so every state between &ldquo;click&rdquo;
              and &ldquo;confirmed&rdquo; has to be visible and named. In {solidify.title}, a{" "}
              {solidify.stack[0]} dApp, I built the ICO, governance-token and airdrop flows and
              contributed to the contracts and their Hardhat tests.
            </p>
          </div>
          <div className="lg:pt-8">
            <ul className="space-y-2.5 text-sm leading-relaxed text-muted-foreground">
              {[
                "6+ wallet providers through RainbowKit and Wagmi.",
                "Real-time transaction tracking from signature to confirmation.",
                "ERC-20 and ERC-721 contracts tested with Hardhat across 800+ testnet transactions; gas costs down 10%.",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            {alite && (
              <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Web3 stack">
                {alite.stack.map((item) => (
                  <li key={item}>
                    <Chip>{item}</Chip>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <figure className="mt-8 min-w-0 sm:mt-10">
          <div className="glass-subtle overflow-x-auto rounded-xl p-3 sm:p-6">
            <TxLifecycleDiagram />
          </div>
          <figcaption className="mt-3 text-xs leading-relaxed text-muted-foreground">
            The transaction states the UI had to render. Solid arrows are the happy path; dashed
            arrows are the exits. Double borders mark end states.
          </figcaption>
        </figure>
      </Card>
    </HomeSection>
  );
}
