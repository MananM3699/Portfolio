import { profile } from "@/content/site";
import ProfileCard from "@/components/ui/profile-card";

/**
 * 3D animated portrait card for the hero, adapted from React Bits ProfileCard.
 * Tilts interactively with cursor movement and mobile orientation, displaying holographic
 * foil with a code-symbol pattern, parallax depth, and realistic lighting.
 * Falls back gracefully to a monogram card if a photo asset is not configured.
 */
export function HeroPortrait() {
  const photo: string = profile.photo;
  const initials = profile.name
    .split(" ")
    .map((p) => p[0])
    .join("");

  return (
    <div className="relative mx-auto w-full max-w-[20rem] sm:max-w-[22rem] lg:max-w-[24rem]">
      {/* Radial brand glow behind the 3D card */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-8 -z-10 rounded-[3rem] bg-[radial-gradient(closest-side,var(--brand),transparent)] opacity-35 blur-2xl"
      />

      <ProfileCard
        avatarUrl={photo || undefined}
        avatarPosition="50% 18%"
        iconUrl="/foil-pattern.svg"
        miniAvatarUrl={photo || undefined}
        name={profile.name}
        title={`${profile.role} · ${profile.company}`}
        handle="@mandaliyamanan"
        status={profile.status || "Open to conversations"}
        statusColor="#4ade80"
        contactText="Contact"
        contactHref="/contact"
        enableTilt
        tiltStrength={13}
        parallax={10}
        holo={0.85}
        glare={0.55}
        enableMobileTilt
        intro
        className="w-full"
      >
        {!photo && (
          <div className="flex h-full flex-col items-center justify-center gap-5 pb-20 text-center">
            <div className="relative">
              <div
                aria-hidden
                className="absolute inset-0 rounded-full bg-[conic-gradient(from_200deg,var(--brand),var(--chart-3),var(--chart-2),var(--brand))] opacity-80 blur-md"
              />
              <div className="relative flex size-32 items-center justify-center rounded-full border border-white/15 bg-background/80 font-mono text-4xl font-semibold tracking-tight text-foreground sm:size-36 sm:text-5xl">
                <span className="text-gradient">{initials}</span>
              </div>
            </div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-subtle-foreground">
              {profile.location}
            </p>
          </div>
        )}
      </ProfileCard>
    </div>
  );
}
