import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CopyEmail } from "@/components/home/copy-email";
import { Container } from "@/components/ui/primitives";
import { openTo, profile } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${profile.name}: book a 1:1 meeting, send an email or call.`,
};

const linkedinLabel = profile.linkedin.replace(/^https?:\/\/(www\.)?/, "");

type Action = { title: string; body: string; value: string; href: string; external?: boolean };

// The three ways to start a conversation. LinkedIn lives in "Direct channels".
function getActions(): Action[] {
  const schedulingUrl: string = profile.schedulingUrl;
  const actions: Action[] = [];
  if (schedulingUrl) {
    actions.push({
      title: "1:1 meeting",
      body: "A 30-minute video call to talk through a role or a project.",
      value: "Pick a time",
      href: schedulingUrl,
      external: true,
    });
  }
  actions.push(
    {
      title: "Email",
      body: "Tell me about the role or the project. I'll reply with next steps.",
      value: profile.email,
      href: `mailto:${profile.email}`,
    },
    {
      title: "Phone",
      body: "Prefer to talk directly? I'm on IST (UTC+5:30); weekdays work best.",
      value: profile.phone,
      href: profile.phoneHref,
    },
  );
  return actions;
}

export default function ContactPage() {
  return (
    <Container className="pt-14 pb-8 sm:pt-20">
      <div className="border-t border-border-strong pt-4">
        <p className="flex items-baseline gap-3 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-subtle-foreground">
          <span className="text-brand">00</span>
          <span>Contact</span>
        </p>
        <h1
          id="contact-title"
          className="mt-8 max-w-5xl font-serif text-[clamp(3.25rem,9vw,7.5rem)] leading-[0.92] tracking-[-0.03em] text-balance text-foreground"
        >
          Let&apos;s build something that <span className="text-brand">ships.</span>
        </h1>
        <p className="mt-8 max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground">
          Hiring for a senior frontend or full-stack engineer, or need a hand with a frontend
          architecture? Pick whichever channel suits you.
        </p>
      </div>

      <div className="mt-20 grid gap-16 lg:grid-cols-12 lg:gap-8">
        <div className="space-y-14 lg:col-span-4">
          <section aria-labelledby="open-to">
            <h2 id="open-to" className="font-mono text-[0.7rem] font-normal uppercase tracking-[0.14em] text-subtle-foreground">
              I&apos;m open to
            </h2>
            <ul className="mt-4 divide-y divide-border border-y border-border">
              {openTo.map((item) => (
                <li key={item} className="py-3 text-sm text-foreground">
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="channels">
            <h2 id="channels" className="font-mono text-[0.7rem] font-normal uppercase tracking-[0.14em] text-subtle-foreground">
              Direct channels
            </h2>
            <dl className="mt-4 divide-y divide-border border-y border-border">
              <Channel label="Email">
                <CopyEmail email={profile.email} />
              </Channel>
              <Channel label="Phone">
                <a href={profile.phoneHref} className="font-mono text-sm text-foreground hover:text-brand">
                  {profile.phone}
                </a>
              </Channel>
              <Channel label="LinkedIn">
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm break-all text-foreground hover:text-brand"
                >
                  {linkedinLabel}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </Channel>
              <Channel label="Location">
                <span className="font-mono text-sm text-foreground">
                  {profile.location} · IST · remote
                </span>
              </Channel>
            </dl>
          </section>
        </div>

        <section aria-labelledby="get-in-touch" className="lg:col-span-8">
          <h2 id="get-in-touch" className="font-mono text-[0.7rem] font-normal uppercase tracking-[0.14em] text-subtle-foreground">
            Get in touch
          </h2>
          <ul className="mt-4 border-t border-border">
            {getActions().map((a) => (
              <li key={a.title} className="border-b border-border">
                <a
                  href={a.href}
                  {...(a.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="group grid gap-x-8 gap-y-2 py-8 transition-colors hover:bg-muted/40 sm:px-4 md:grid-cols-[1fr_auto]"
                >
                  <span>
                    <span className="block font-serif text-4xl leading-none text-foreground transition-colors group-hover:text-brand sm:text-5xl">
                      {a.title}
                    </span>
                    <span className="mt-3 block max-w-md text-sm leading-relaxed text-muted-foreground">
                      {a.body}
                    </span>
                  </span>
                  <span className="font-mono text-sm break-all text-foreground transition-colors group-hover:text-brand md:self-end">
                    {a.value} ↗
                    {a.external && <span className="sr-only"> (opens in a new tab)</span>}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Container>
  );
}

function Channel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[6rem_minmax(0,1fr)] sm:items-baseline">
      <dt className="font-mono text-xs text-subtle-foreground">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}
