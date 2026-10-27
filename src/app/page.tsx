import { About } from "@/components/home/about";
import { Contact } from "@/components/home/contact";
import { ExperienceTimeline } from "@/components/home/experience-timeline";
import { Hero } from "@/components/home/hero";
import { MoreWork } from "@/components/home/more-work";
import { HowIWork } from "@/components/home/how-i-work";
import { ProofBar } from "@/components/home/proof-bar";
import { SelectedWork } from "@/components/home/selected-work";
import { TechMarquee } from "@/components/home/tech-marquee";
import { Skills } from "@/components/home/skills";
import { Web3Chapter } from "@/components/home/web3-chapter";

// The root layout supplies title and description defaults; the home page uses them as-is.
export default function Home() {
  return (
    <>
      <Hero />
      <TechMarquee />
      <About />
      <ProofBar />
      <SelectedWork />
      <Web3Chapter />
      <MoreWork />
      <HowIWork />
      <ExperienceTimeline />
      <Skills />
      <Contact />
    </>
  );
}
