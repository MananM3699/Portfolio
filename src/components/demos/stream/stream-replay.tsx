"use client";

import { useId, useRef } from "react";
import { RefreshCw, RotateCcw, Sparkles, Square, TriangleAlert } from "lucide-react";
import { DemoFrame } from "@/components/case-study/case-study";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Chip } from "@/components/ui/primitives";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/cn";
import { StreamChart } from "./chart";
import { fixtures, getFixture } from "./fixtures";
import { useReplay, type Phase, type ReplayState } from "./use-replay";

const phaseBadge: Record<Phase, { label: string; className: string }> = {
  idle: { label: "idle", className: "border-border bg-muted text-muted-foreground" },
  streaming: { label: "streaming", className: "border-brand/25 bg-brand-soft text-brand" },
  done: { label: "complete", className: "border-success/25 bg-success-soft text-success" },
  stopped: { label: "stopped", className: "border-warning/25 bg-warning-soft text-warning" },
  error: { label: "failed", className: "border-danger/25 bg-danger-soft text-danger" },
};

/** Small glass action button used for Stop / Regenerate / Retry. */
const actionButton =
  "glass-subtle h-8 gap-1.5 rounded-lg border-border! px-3 text-xs text-foreground transition-[background-color,color,translate] duration-150 hover:border-border-strong! hover:bg-card hover:text-foreground";

/**
 * SolBI streaming replay: a recorded natural-language BI answer played back through
 * an SSE-shaped transport. Text streams first; the chart appears only after its
 * JSON payload passes schema validation.
 */
export function StreamReplay() {
  const { state, ask, stop, regenerate, reducedMotion } = useReplay();
  const actionRef = useRef<HTMLButtonElement>(null);
  const inputId = useId();
  const chipsLabelId = useId();

  const streaming = state.phase === "streaming";
  const question = state.questionId ? getFixture(state.questionId).question : "";
  const badge = phaseBadge[state.phase];

  const retry = () => {
    regenerate();
    // The Retry button unmounts once the new run starts; keep focus on the composer.
    actionRef.current?.focus();
  };

  return (
    <DemoFrame title="solbi · ask your data" note="Replayed · mock data · no live LLM">
      <div className="space-y-5 p-4 sm:p-6">
        <div>
          <p
            id={chipsLabelId}
            className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-subtle-foreground"
          >
            Try a question
          </p>
          {/* Single-select: the chosen question stays highlighted. Selecting the active chip again
              replays it, so value changes are ignored and every click asks. */}
          <ToggleGroup
            type="single"
            aria-labelledby={chipsLabelId}
            value={state.questionId ?? ""}
            spacing={2}
            className="mt-2.5 w-full flex-wrap"
          >
            {fixtures.map((fixture) => {
              const failsNext =
                fixture.failOnFirstRunAfter !== undefined && !state.failuresUsed.includes(fixture.id);
              return (
                <ToggleGroupItem
                  key={fixture.id}
                  value={fixture.id}
                  onClick={() => ask(fixture.id)}
                  className={cn(
                    "glass-subtle h-auto min-h-9 shrink rounded-full border-border! px-3.5 py-1.5 text-left font-normal whitespace-normal text-muted-foreground",
                    "transition-[background-color,color,border-color,translate] duration-150 hover:-translate-y-px hover:border-border-strong! hover:bg-card hover:text-foreground",
                    "data-[state=on]:border-brand/45! data-[state=on]:bg-brand-soft data-[state=on]:text-brand data-[state=on]:hover:bg-brand-soft",
                  )}
                >
                  {/* One inline run so the "fails once" note wraps with the text, not as a column. */}
                  <span>
                    {fixture.question}
                    {failsNext && (
                      <span className="ml-1.5 font-mono text-[0.65rem] whitespace-nowrap text-subtle-foreground">
                        · fails once
                      </span>
                    )}
                  </span>
                </ToggleGroupItem>
              );
            })}
          </ToggleGroup>
        </div>

        <div className="glass-subtle flex items-center gap-2 rounded-xl border-border! py-1.5 pr-1.5 pl-3.5 transition-shadow duration-150 has-[input:focus-visible]:border-ring! has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-ring/40">
          <Sparkles className="size-4 shrink-0 text-brand" aria-hidden />
          <label htmlFor={inputId} className="sr-only">
            Question (read-only in this replay)
          </label>
          <Input
            id={inputId}
            readOnly
            value={question}
            placeholder="Pick a question above"
            className="h-8 flex-1 border-0 bg-transparent px-0 text-sm text-foreground shadow-none placeholder:text-subtle-foreground focus-visible:ring-0 md:text-sm dark:bg-transparent"
          />
          {/* One button that switches role keeps keyboard focus in place when a run ends. */}
          <Button
            ref={actionRef}
            type="button"
            variant="ghost"
            size="sm"
            onClick={streaming ? stop : regenerate}
            disabled={!state.questionId}
            className={cn(actionButton, "max-sm:w-8 max-sm:px-0", !streaming && "text-muted-foreground")}
          >
            {streaming ? (
              <Square className="size-3 fill-current" aria-hidden />
            ) : (
              <RotateCcw className="size-3.5" aria-hidden />
            )}
            {/* Icon-only below sm so the read-only question keeps its width; the name stays for AT. */}
            <span className="max-sm:sr-only">{streaming ? "Stop" : "Regenerate"}</span>
          </Button>
        </div>

        <section aria-label="Answer" aria-busy={streaming} className="glass-subtle overflow-hidden rounded-xl border-border!">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-subtle-foreground">Answer</p>
            <Badge variant="outline" className={cn("h-6 rounded-md px-2 font-mono text-[0.72rem] font-normal", badge.className)}>
              {streaming && (
                <span className="size-1.5 rounded-full bg-current motion-safe:animate-pulse" aria-hidden />
              )}
              {badge.label}
            </Badge>
          </div>
          <div className="min-h-40 space-y-5 p-3.5 sm:p-5">
            <AnswerBody state={state} onRetry={retry} />
          </div>
        </section>

        {/* Screen readers hear whole sentences, never individual tokens. */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {state.announcement}
        </div>

        <StatusLine state={state} reducedMotion={reducedMotion} />
      </div>
    </DemoFrame>
  );
}

function AnswerBody({ state, onRetry }: { state: ReplayState; onRetry: () => void }) {
  const { phase, text, chart } = state;

  if (phase === "idle") {
    return (
      <p className="text-sm leading-relaxed text-subtle-foreground">
        Pick a question to replay a recorded answer. The text streams first; the chart renders only after
        its JSON payload passes schema validation.
      </p>
    );
  }

  return (
    <>
      <p className="text-[0.95rem] leading-relaxed text-foreground">
        {text}
        {phase === "streaming" && (
          <span
            className="caret ml-0.5 inline-block h-[1.05em] w-0.5 translate-y-[0.18em] bg-brand"
            aria-hidden
          />
        )}
        {phase === "streaming" && !text && (
          <span className="font-mono text-xs text-subtle-foreground"> planning query…</span>
        )}
        {phase === "stopped" && (
          <>
            {" "}
            <Chip tone="warning">stopped</Chip>
          </>
        )}
      </p>

      {phase === "error" && (
        <div
          role="alert"
          className="flex flex-wrap items-start gap-3 rounded-lg border border-danger/20 bg-danger-soft p-3.5 text-sm"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-foreground">The stream was interrupted.</p>
            <p className="mt-0.5 text-muted-foreground">{state.error} The partial answer is kept above.</p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onRetry} className={actionButton}>
            <RefreshCw className="size-3.5" aria-hidden />
            Retry
          </Button>
        </div>
      )}

      {chart.status === "ready" && <StreamChart key={state.runId} payload={chart.payload} />}

      {chart.status === "invalid" && (
        <div className="flex items-start gap-3 rounded-lg border border-warning/25 bg-warning-soft p-3.5 text-sm">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
          <div className="min-w-0">
            <p className="font-medium text-foreground">Couldn&apos;t render chart</p>
            <p className="mt-0.5 text-muted-foreground">
              The data payload failed validation, so the answer is shown as text only.
            </p>
            <p className="mt-1.5 break-words font-mono text-xs text-subtle-foreground">{chart.reason}</p>
          </div>
        </div>
      )}

      {chart.status === "pending" && phase === "streaming" && (
        <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-border-strong bg-muted/50 px-4 text-center font-mono text-[0.7rem] text-subtle-foreground">
          awaiting data event · chart renders after validation
        </div>
      )}

      {chart.status === "pending" && phase === "stopped" && (
        <p className="font-mono text-xs text-subtle-foreground">
          Stopped before the data event arrived, so there is no chart.
        </p>
      )}
    </>
  );
}

function StatusLine({ state, reducedMotion }: { state: ReplayState; reducedMotion: boolean }) {
  const { lastEvent, chunks, flushes, elapsedMs } = state.stats;
  const parts =
    state.phase === "idle"
      ? ["no stream open"]
      : [
          `event: ${lastEvent ?? "open"}`,
          `${chunks} chunks`,
          `${flushes} flushes`,
          `${(elapsedMs / 1000).toFixed(1)}s`,
        ];
  if (reducedMotion) parts.push("reduced motion: instant");

  return (
    <p className="flex flex-wrap gap-x-2 font-mono text-[0.7rem] text-muted-foreground tabular-nums">
      {parts.map((part, i) => (
        <span key={i}>
          {i > 0 && (
            <span className="mr-2" aria-hidden>
              ·
            </span>
          )}
          {part}
        </span>
      ))}
    </p>
  );
}
