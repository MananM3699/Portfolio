import Link from "next/link";
import { ArrowRight, ArrowUpRight, CalendarDays, FileText, Linkedin, Mail, Phone } from "lucide-react";
import { Eyebrow } from "@/components/ui/primitives";
import { profile } from "@/content/site";
import { CopyEmail } from "./copy-email";
import { HomeSection } from "./section";

export function Contact() {
  const schedulingUrl: string = profile.schedulingUrl;

  return (
    <HomeSection id="contact" className="pb-24 sm:pb-28" aria-labelledby="contact-title">
      <div className="glass relative isolate overflow-hidden rounded-3xl">
        {/* Decorative: grid, two colour washes and a top edge highlight. */}
        <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 -z-10 opacity-60" />
        <span
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-24 -z-10 size-112 rounded-full bg-cta-to/25 blur-3xl"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -left-24 -z-10 size-112 rounded-full bg-chart-2/15 blur-3xl"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-brand/80 to-transparent"
        />

        <div className="grid grid-cols-1 gap-10 p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,23rem)] lg:items-center lg:gap-14 lg:p-14">
          {/* Left: the pitch */}
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full border border-success/25 bg-success-soft px-3 py-1 font-mono text-xs text-success">
              <span className="relative flex size-1.5" aria-hidden>
                <span className="absolute inset-0 rounded-full bg-success/60 motion-safe:animate-ping" />
                <span className="relative size-1.5 rounded-full bg-success" />
              </span>
              {profile.status}
            </p>

            <Eyebrow className="mt-8">Contact</Eyebrow>
            <h2
              id="contact-title"
              className="mt-3 text-[clamp(2.25rem,4.6vw,3.5rem)] leading-[1.04] font-bold tracking-[-0.035em] text-balance text-foreground"
            >
              Hiring a senior frontend engineer?{" "}
              <span className="text-gradient">Let&apos;s talk.</span>
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">
              Book a 30-minute call, or send a message. I&apos;m in {profile.location} and work in
              IST (UTC+5:30), remote-friendly.
            </p>

            <ul className="mt-8 flex flex-wrap items-center gap-x-1 gap-y-2 text-sm">
              <li>
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Linkedin className="size-4" aria-hidden />
                  LinkedIn
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>
              <li>
                <a
                  href={profile.resumePath}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <FileText className="size-4" aria-hidden />
                  Resume PDF
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-brand transition-colors hover:bg-brand-soft"
                >
                  All contact options
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </li>
            </ul>
          </div>

          {/* Right: three ways in, the 1:1 meeting first */}
          <ul className="grid grid-cols-1 gap-3">
            {schedulingUrl && (
              <li>
                <a
                  href={schedulingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-2xl bg-linear-to-br from-cta-from to-cta-to p-4 text-white sm:gap-4 sm:p-5 shadow-[inset_0_1px_0_rgb(255_255_255/0.28),0_18px_40px_-16px_var(--cta-from)] transition-[filter,translate] duration-200 hover:-translate-y-0.5 hover:brightness-110"
                >
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
                    <CalendarDays className="size-6" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-semibold sm:text-lg">Book a 1:1 meeting</span>
                    <span className="mt-0.5 block text-sm text-white/80">
                      30 minutes · video call
                    </span>
                  </span>
                  <ArrowUpRight
                    className="size-5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden
                  />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>
            )}

            <li className="glass-subtle flex flex-col items-start gap-3 rounded-2xl p-3.5 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-brand/25 bg-brand-soft text-brand">
                <Mail className="size-5" aria-hidden />
              </span>
              <div className="min-w-0 max-w-full">
                <p className="font-mono text-[0.7rem] tracking-[0.14em] text-subtle-foreground uppercase">
                  Email
                </p>
                <CopyEmail email={profile.email} className="-ml-1 mt-1" />
              </div>
            </li>

            <li>
              <a
                href={profile.phoneHref}
                className="glass-subtle group flex flex-col items-start gap-3 rounded-2xl p-4 transition-colors hover:border-brand/40 sm:flex-row sm:items-center sm:gap-4"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-brand/25 bg-brand-soft text-brand">
                  <Phone className="size-5" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block font-mono text-[0.7rem] tracking-[0.14em] text-subtle-foreground uppercase">
                    Phone
                  </span>
                  <span className="mt-1 block font-mono text-sm text-foreground transition-colors group-hover:text-brand">
                    {profile.phone}
                  </span>
                </span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </HomeSection>
  );
}
