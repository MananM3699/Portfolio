import Image from "next/image";
import { profile } from "@/content/site";

// Fades all four edges into the page background: one horizontal and one vertical gradient, intersected.
const fade = {
  maskImage:
    "linear-gradient(to right, transparent, #000 28%, #000 72%, transparent), linear-gradient(to bottom, transparent, #000 24%, #000 78%, transparent)",
  maskComposite: "intersect",
  WebkitMaskImage:
    "linear-gradient(to right, transparent, #000 28%, #000 72%, transparent), linear-gradient(to bottom, transparent, #000 24%, #000 78%, transparent)",
  WebkitMaskComposite: "source-in",
} as const;

/** Large portrait with softly faded edges, no frame. Sits in the right column of the hero. */
export function HeroPortrait() {
  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-[26rem] sm:max-w-[30rem] lg:ml-auto lg:max-w-none" style={fade}>
      {/* 4:5 crop anchored to the top keeps the face centred and trims the photo's bottom edge. */}
      <Image
        src={profile.photo}
        alt={`Portrait of ${profile.name}`}
        fill
        priority
        sizes="(min-width: 1024px) 34vw, 90vw"
        className="object-cover object-top"
      />
    </div>
  );
}
