import { Github, Linkedin, Phone } from "lucide-react";
import { buttonClass } from "@/components/ui/primitives";
import { profile } from "@/content/site";

/** Phone and LinkedIn always; GitHub only when profile.github is set. */
export function SocialLinks() {
  const github: string = profile.github;
  return (
    <>
      <a href={profile.phoneHref} className={buttonClass("ghost", "h-9 px-3 font-mono text-[0.8rem]")}>
        <Phone className="size-4" aria-hidden />
        <span className="sr-only">Call </span>
        {profile.phone}
      </a>
      <a
        href={profile.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClass("ghost", "h-9 px-3")}
      >
        <Linkedin className="size-4" aria-hidden />
        LinkedIn
        <span className="sr-only">(opens in a new tab)</span>
      </a>
      {github && (
        <a
          href={github}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass("ghost", "h-9 px-3")}
        >
          <Github className="size-4" aria-hidden />
          GitHub
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      )}
    </>
  );
}
