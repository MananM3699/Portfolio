"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/cn";

type CopyState = "idle" | "copied" | "error";

/** Visible email address plus a copy button. The status text is announced politely. */
export function CopyEmail({ email, className }: { email: string; className?: string }) {
  const [state, setState] = useState<CopyState>("idle");
  const [tipOpen, setTipOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    // Radix closes the tooltip on pointerdown; reopen it so "Copied" is visible.
    setTipOpen(true);
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
    <div className={cn("flex flex-wrap items-center gap-x-2 gap-y-1", className)}>
      <div className="glass-subtle inline-flex min-w-0 items-center rounded-xl p-0.5 backdrop-blur-md">
        <a
          href={`mailto:${email}`}
          className="min-w-0 truncate rounded-l-[0.6rem] px-2.5 py-1.5 font-mono text-[0.78rem] text-foreground sm:px-3 sm:text-sm transition-colors duration-150 hover:text-brand"
        >
          {email}
        </a>
        <Tooltip open={tipOpen} onOpenChange={setTipOpen}>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={copy}
              aria-label="Copy email address"
              className="rounded-[0.6rem] text-muted-foreground hover:bg-brand-soft hover:text-brand"
            >
              {state === "copied" ? (
                <Check className="size-4 text-brand" aria-hidden />
              ) : (
                <Copy className="size-4" aria-hidden />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={6}>
            {state === "copied" ? "Copied" : "Copy email"}
          </TooltipContent>
        </Tooltip>
      </div>
      <span role="status" aria-live="polite" className="font-mono text-xs text-muted-foreground">
        {state === "copied" && "Copied to clipboard"}
        {state === "error" && "Couldn't copy. Select the address instead."}
      </span>
    </div>
  );
}
