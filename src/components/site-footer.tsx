import { LAST_UPDATED, profile } from "@/content/site";
import { Container } from "./ui/primitives";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border">
      <Container className="flex flex-col gap-3 py-8 text-sm text-subtle-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          {profile.name} · {profile.location} (IST) · Last updated {LAST_UPDATED}
        </p>
        <p className="font-mono text-xs">
          Built with Next.js, TypeScript & Tailwind. Demos are recreated with mock data.
        </p>
      </Container>
    </footer>
  );
}
