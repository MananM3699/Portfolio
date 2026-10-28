"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type CopyState = "idle" | "copied" | "error";

/** Email as plain mono text with a quiet "Copy" action. The result is announced politely. */
export function CopyEmail({ email, className }: { email: string; className?: string }) {
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setState("copied");
    } catch {
      setState("error");
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), 2500);
  }

  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-3", className)}>
      <a
        href={`mailto:${email}`}
        className="font-mono text-sm text-foreground underline decoration-border-strong underline-offset-4 transition-colors hover:text-brand hover:decoration-brand"
      >
        {email}
      </a>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy email address"
        className="font-mono text-xs text-subtle-foreground transition-colors hover:text-brand"
      >
        {state === "copied" ? "Copied" : "Copy"}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {state === "copied" ? "Email copied to clipboard" : state === "error" ? "Could not copy" : ""}
      </span>
    </span>
  );
}
