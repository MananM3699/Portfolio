import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Mail,
  Phone,
  type LucideIcon,
} from "lucide-react";
import { CopyEmail } from "@/components/home/copy-email";
import { Container } from "@/components/ui/primitives";
import { openTo, profile } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${profile.name}: book a 1:1 meeting, send an email or call.`,
};

const linkedinLabel = profile.linkedin.replace(/^https?:\/\/(www\.)?/, "");

type Action = {
  icon: LucideIcon;
  title: string;
  body: string;
  href: string;
  cta: string;
  external?: boolean;
};

// "Get in touch" is the three ways to start a conversation; LinkedIn lives in Direct channels.
function getActions(): Action[] {
  const schedulingUrl: string = profile.schedulingUrl;
  const actions: Action[] = [];
  if (schedulingUrl) {
    actions.push({
      icon: CalendarDays,
      title: "Schedule a 1:1 meeting",
      body: "Book a 30-minute video call to talk through a role or a project.",
      href: schedulingUrl,
      cta: "Pick a time that works for you",
      external: true,
    });
  }
  actions.push(
    {
      icon: Mail,
      title: "Send an email",
      body: "Tell me about the role or the project. I'll reply with next steps.",
      href: `mailto:${profile.email}`,
      cta: profile.email,
    },
    {
      icon: Phone,
      title: "Contact by phone",
      body: "Prefer to talk directly? I'm on IST (UTC+5:30); weekdays work best.",
      href: profile.phoneHref,
      cta: profile.phone,
    },
  );
  return actions;
}

export default function ContactPage() {
  return (
    <section aria-labelledby="contact-title" className="relative isolate overflow-hidden">
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 -z-10" />

      <Container className="pt-16 pb-20 sm:pt-24">
        <p className="flex items-center gap-3 font-mono text-xs font-medium uppercase tracking-[0.18em] text-brand">
          <span aria-hidden className="h-px w-8 bg-brand/60" />
          Contact
          <span aria-hidden className="h-px w-16 bg-linear-to-r from-brand/60 to-transparent" />
        </p>
        <h1
          id="contact-title"
          className="mt-6 max-w-4xl text-[clamp(2.5rem,7vw,5rem)] leading-[1] font-bold tracking-[-0.035em] text-balance text-foreground"
        >
          Let&apos;s build something that <span className="text-gradient">ships.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-muted-foreground">
          Hiring for a senior frontend or full-stack engineer, or need a hand with a frontend
          architecture? Pick whichever channel suits you.
        </p>

        <div className="mt-16 grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div className="space-y-12">
            <div>
              <h2 className="text-lg font-semibold text-foreground">I&apos;m open to:</h2>
              <ul className="mt-5 space-y-3">
                {openTo.map((item) => (
                  <li key={item} className="flex items-start gap-3 font-mono text-sm text-muted-foreground">
                    <ArrowRight className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-mono text-xs uppercase tracking-[0.16em] text-brand">
                Direct channels
              </h2>
              <dl className="glass mt-5 divide-y divide-border rounded-2xl px-5">
                <Channel label="Email">
                  <CopyEmail email={profile.email} />
                </Channel>
                <Channel label="Phone">
                  <a href={profile.phoneHref} className="hover:text-brand">
                    {profile.phone}
                  </a>
                </Channel>
                <Channel label="LinkedIn">
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all hover:text-brand"
                  >
                    {linkedinLabel}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </Channel>
                <Channel label="Location">
                  {profile.location} · IST · remote
                </Channel>
              </dl>
            </div>
          </div>

          <div>
            <h2 className="font-mono text-xs uppercase tracking-[0.16em] text-brand">
              Get in touch
            </h2>
            <ul className="mt-5 grid gap-4">
              {getActions().map((action) => (
                <li key={action.title}>
                  <ActionCard action={action} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Channel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 py-4 sm:grid-cols-[6rem_minmax(0,1fr)] sm:items-center sm:gap-4">
      <dt className="font-mono text-xs text-subtle-foreground">{label}</dt>
      <dd className="min-w-0 font-mono text-sm text-foreground">{children}</dd>
    </div>
  );
}

function ActionCard({ action }: { action: Action }) {
  const Icon = action.icon;
  return (
    <a
      href={action.href}
      {...(action.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="glass group flex gap-4 rounded-2xl p-5 transition-[translate,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[0_20px_56px_-18px_rgb(79_70_229/0.45)] sm:gap-5 sm:p-6"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-brand/25 bg-brand-soft text-brand">
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block font-semibold text-foreground">{action.title}</span>
        <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{action.body}</span>
        <span className="mt-3 inline-flex max-w-full items-center gap-1.5 font-mono text-sm break-all text-brand">
          {action.cta}
          <ArrowUpRight
            className="size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden
          />
        </span>
        {action.external && <span className="sr-only"> (opens in a new tab)</span>}
      </span>
    </a>
  );
}
