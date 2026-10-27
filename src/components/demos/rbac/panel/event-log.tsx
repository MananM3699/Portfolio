"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/cn";
import { cleared, type ActivityKind } from "../store/activity-slice";
import { useAppDispatch, useAppSelector } from "../store/store";

const kindStyle: Record<ActivityKind, { tag: string; className: string }> = {
  role: { tag: "rbac", className: "text-brand" },
  matrix: { tag: "rbac", className: "text-brand" },
  route: { tag: "nav", className: "text-muted-foreground" },
  denied: { tag: "403", className: "text-danger" },
  fetch: { tag: "query", className: "text-muted-foreground" },
  refetch: { tag: "query", className: "text-brand" },
  resolved: { tag: "cache", className: "text-success" },
  mutation: { tag: "mutate", className: "text-warning" },
  invalidated: { tag: "tags", className: "text-warning" },
  error: { tag: "error", className: "text-danger" },
};

const clock = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  fractionalSecondDigits: 3,
  hour12: false,
});

/** Newest first, so the latest event is always visible without auto-scrolling. */
export function EventLog() {
  const dispatch = useAppDispatch();
  const entries = useAppSelector((s) => s.activity.entries);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-medium text-foreground">Event log</h4>
          <p className="text-xs text-muted-foreground">Real store actions, not a script.</p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => dispatch(cleared())}
              disabled={entries.length === 0}
              aria-label="Clear event log"
              className="text-muted-foreground"
            >
              <Trash2 aria-hidden />
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={6}>Clear event log</TooltipContent>
        </Tooltip>
      </div>
      <div
        tabIndex={0}
        aria-label="Event log entries"
        className="glass-subtle h-64 overflow-y-auto rounded-xl font-mono text-[0.68rem] leading-5"
      >
        {entries.length === 0 ? (
          <p className="px-3 py-2 text-muted-foreground">Switch roles or approve a request…</p>
        ) : (
          <ol className="divide-y divide-border">
            {[...entries].reverse().map((entry) => (
              <li key={entry.id} className="flex gap-2 px-3 py-1">
                <time className="shrink-0 text-subtle-foreground tabular-nums" dateTime={new Date(entry.at).toISOString()}>
                  {clock.format(entry.at)}
                </time>
                <span className={cn("w-12 shrink-0", kindStyle[entry.kind].className)}>
                  {kindStyle[entry.kind].tag}
                </span>
                <span className="min-w-0 break-words text-foreground">{entry.message}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
