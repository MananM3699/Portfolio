import { profile } from "@/content/site";

const link =
  "font-mono text-sm text-muted-foreground underline decoration-border-strong underline-offset-4 transition-colors hover:text-brand hover:decoration-brand";

/** Phone and LinkedIn always; GitHub only when profile.github is set. Plain text links. */
export function SocialLinks({ className }: { className?: string }) {
  const github: string = profile.github;
  return (
    <>
      <a href={profile.phoneHref} className={className ?? link}>
        {profile.phone}
      </a>
      <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className={className ?? link}>
        LinkedIn<span className="sr-only"> (opens in a new tab)</span>
      </a>
      {github && (
        <a href={github} target="_blank" rel="noopener noreferrer" className={className ?? link}>
          GitHub<span className="sr-only"> (opens in a new tab)</span>
        </a>
      )}
    </>
  );
}
