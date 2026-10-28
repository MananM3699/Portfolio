import Link from "next/link";
import { LAST_UPDATED, profile } from "@/content/site";
import { Container } from "./ui/primitives";

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-border-strong">
      <Container className="grid gap-10 py-12 sm:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <p className="font-serif text-3xl text-foreground">{profile.name}</p>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            {profile.role}. Based in {profile.location}, working remotely.
          </p>
        </div>
        <nav aria-label="Footer" className="text-sm">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-subtle-foreground">Site</p>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            <li><Link href="/#work" className="hover:text-foreground">Projects</Link></li>
            <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
            <li><a href={profile.resumePath} target="_blank" rel="noopener" className="hover:text-foreground">Resume (PDF)</a></li>
          </ul>
        </nav>
        <div className="text-sm">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-subtle-foreground">Elsewhere</p>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            <li><a href={`mailto:${profile.email}`} className="hover:text-foreground">{profile.email}</a></li>
            <li><a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">LinkedIn</a></li>
          </ul>
        </div>
      </Container>
      <Container className="flex flex-col gap-2 border-t border-border py-6 font-mono text-[0.7rem] text-subtle-foreground sm:flex-row sm:justify-between">
        <p>Last updated {LAST_UPDATED}</p>
        <p>Next.js · TypeScript · Tailwind. Demos are recreated with mock data.</p>
      </Container>
    </footer>
  );
}
