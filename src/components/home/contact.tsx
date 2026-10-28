import Link from "next/link";
import { Container } from "@/components/ui/primitives";
import { profile } from "@/content/site";
import { CopyEmail } from "./copy-email";

const textLink =
  "text-sm text-muted-foreground underline decoration-border-strong underline-offset-4 transition-colors hover:text-brand hover:decoration-brand";

type Channel = { label: string; value: string; href: string; external?: boolean };

/** Closing statement: one large headline, then the ways in as ruled rows. */
export function Contact() {
  const schedulingUrl: string = profile.schedulingUrl;
  const channels: Channel[] = [
    ...(schedulingUrl
      ? [{ label: "1:1 meeting", value: "Book 30 minutes", href: schedulingUrl, external: true }]
      : []),
    { label: "Email", value: profile.email, href: `mailto:${profile.email}` },
    { label: "Phone", value: profile.phone, href: profile.phoneHref },
  ];

  return (
    <section id="contact" aria-labelledby="contact-title" className="py-20 sm:py-28">
      <Container>
        <div className="border-t border-border-strong pt-4">
          <p className="flex items-baseline gap-3 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-subtle-foreground">
            <span className="text-brand">07</span>
            <span>Contact</span>
          </p>
          <h2
            id="contact-title"
            className="mt-8 max-w-5xl font-serif text-[clamp(2.5rem,7vw,6.5rem)] leading-[0.95] tracking-[-0.025em] text-balance text-foreground"
          >
            Hiring a senior frontend engineer? <span className="text-brand">Let&apos;s talk.</span>
          </h2>
        </div>

        <ul className="mt-16 border-t border-border">
          {channels.map((c) => (
            <li key={c.label} className="border-b border-border">
              <a
                href={c.href}
                {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="group grid items-baseline gap-x-8 gap-y-1 py-6 transition-colors hover:bg-muted/40 sm:px-4 lg:grid-cols-12"
              >
                <span className="font-mono text-xs text-subtle-foreground lg:col-span-3">{c.label}</span>
                <span className="font-serif text-2xl [overflow-wrap:anywhere] text-foreground transition-colors group-hover:text-brand sm:text-4xl lg:col-span-8">
                  {c.value}
                </span>
                <span
                  aria-hidden
                  className="font-mono text-xl text-subtle-foreground transition-colors group-hover:text-brand lg:col-span-1 lg:text-right"
                >
                  ↗
                </span>
                {c.external && <span className="sr-only">(opens in a new tab)</span>}
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap items-baseline gap-x-8 gap-y-3">
          <CopyEmail email={profile.email} />
          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className={textLink}>
            LinkedIn<span className="sr-only"> (opens in a new tab)</span>
          </a>
          <a href={profile.resumePath} target="_blank" rel="noopener" className={textLink}>
            Resume PDF<span className="sr-only"> (opens in a new tab)</span>
          </a>
          <Link href="/contact" className={textLink}>
            All contact options →
          </Link>
        </div>
      </Container>
    </section>
  );
}
