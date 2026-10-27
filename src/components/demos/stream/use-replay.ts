"use client";

import { useCallback, useEffect, useReducer, useRef, useSyncExternalStore } from "react";
import { createEmitter } from "./emitter";
import { getFixture, type QuestionId } from "./fixtures";
import { createFrameBuffer } from "./frame-buffer";
import { parseChartPayload, type ChartPayload } from "./schema";
import {
  createReplayStream,
  pipeToEmitter,
  readEvents,
  type StreamEventType,
  type StreamEvents,
} from "./transport";

export type Phase = "idle" | "streaming" | "done" | "stopped" | "error";

export type ChartState =
  | { status: "pending" }
  | { status: "ready"; payload: ChartPayload }
  | { status: "invalid"; reason: string };

export type Stats = {
  lastEvent: StreamEventType | "abort" | null;
  chunks: number;
  /** React commits caused by token flushes; compare with `chunks`. */
  flushes: number;
  elapsedMs: number;
};

export type ReplayState = {
  runId: number;
  questionId: QuestionId | null;
  phase: Phase;
  text: string;
  chart: ChartState;
  error: string | null;
  stats: Stats;
  /** Index in `text` up to which the live region has already spoken. */
  announcedTo: number;
  announcement: string;
  /** Questions whose one-time simulated failure has already been used. */
  failuresUsed: QuestionId[];
};

type Action =
  | { type: "start"; questionId: QuestionId; injectFailure: boolean }
  | { type: "flush"; text: string; stats: Stats }
  | { type: "chart"; chart: ChartState; stats: Stats }
  | { type: "end"; phase: "done" | "stopped" | "error"; error?: string; stats: Stats };

const emptyStats: Stats = { lastEvent: null, chunks: 0, flushes: 0, elapsedMs: 0 };

const initialState: ReplayState = {
  runId: 0,
  questionId: null,
  phase: "idle",
  text: "",
  chart: { status: "pending" },
  error: null,
  stats: emptyStats,
  announcedTo: 0,
  announcement: "",
  failuresUsed: [],
};

/** End index of the last complete sentence after `from`, or `from` if none. */
function lastSentenceEnd(text: string, from: number): number {
  // Requires trailing whitespace so "$1." in the middle of "$1.90M" never counts.
  const pattern = /[.!?][)"']?\s/g;
  pattern.lastIndex = from;
  let end = from;
  for (let match = pattern.exec(text); match; match = pattern.exec(text)) {
    end = match.index + match[0].length;
  }
  return end;
}

function closingNote(state: ReplayState, action: Extract<Action, { type: "end" }>): string {
  if (action.phase === "stopped") return "Answer stopped.";
  if (action.phase === "error") return `Stream failed: ${action.error ?? "unknown error"} Retry is available.`;
  if (state.chart.status === "ready") return "Chart ready below.";
  if (state.chart.status === "invalid") return "The chart could not be rendered.";
  return "";
}

function reducer(state: ReplayState, action: Action): ReplayState {
  switch (action.type) {
    case "start":
      return {
        ...initialState,
        runId: state.runId + 1,
        questionId: action.questionId,
        phase: "streaming",
        failuresUsed: action.injectFailure ? [...state.failuresUsed, action.questionId] : state.failuresUsed,
      };
    case "flush": {
      const text = state.text + action.text;
      // Announce whole sentences only: a screen reader re-reading every token is unusable.
      const end = lastSentenceEnd(text, state.announcedTo);
      return {
        ...state,
        text,
        stats: action.stats,
        ...(end > state.announcedTo && {
          announcedTo: end,
          announcement: text.slice(state.announcedTo, end).trim(),
        }),
      };
    }
    case "chart":
      return { ...state, chart: action.chart, stats: action.stats };
    case "end": {
      const remainder = state.text.slice(state.announcedTo).trim();
      return {
        ...state,
        phase: action.phase,
        error: action.error ?? null,
        stats: action.stats,
        announcedTo: state.text.length,
        announcement: [remainder, closingNote(state, action)].filter(Boolean).join(" "),
      };
    }
  }
}

const motionQuery = "(prefers-reduced-motion: reduce)";

function subscribeToMotion(onChange: () => void) {
  const query = window.matchMedia(motionQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToMotion,
    () => window.matchMedia(motionQuery).matches,
    () => false,
  );
}

/**
 * Drives one replayed answer at a time: transport -> emitter -> frame buffer -> reducer.
 * Starting a new question aborts the previous run; events from a superseded run are dropped.
 */
export function useReplay() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const reducedMotion = usePrefersReducedMotion();
  const controllerRef = useRef<AbortController | null>(null);
  const failedOnce = useRef(new Set<QuestionId>());

  useEffect(() => () => controllerRef.current?.abort(), []);

  const ask = useCallback(
    (questionId: QuestionId) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      const isCurrent = () => controllerRef.current === controller;

      const fixture = getFixture(questionId);
      let failAfter: number | undefined;
      if (fixture.failOnFirstRunAfter !== undefined && !failedOnce.current.has(questionId)) {
        failedOnce.current.add(questionId);
        failAfter = fixture.failOnFirstRunAfter;
      }

      const startedAt = performance.now();
      const stats: Stats = { ...emptyStats };
      const snapshot = (lastEvent: Stats["lastEvent"]): Stats => {
        stats.lastEvent = lastEvent;
        stats.elapsedMs = performance.now() - startedAt;
        return { ...stats };
      };

      dispatch({ type: "start", questionId, injectFailure: failAfter !== undefined });

      const buffer = createFrameBuffer<string>((tokens) => {
        if (!isCurrent()) return;
        stats.flushes += 1;
        dispatch({ type: "flush", text: tokens.join(""), stats: snapshot("token") });
      });

      const bus = createEmitter<StreamEvents>();
      bus.on("token", ({ text }) => {
        stats.chunks += 1;
        buffer.push(text);
      });
      bus.on("data", ({ payload }) => {
        buffer.flushNow();
        const parsed = parseChartPayload(payload);
        const chart: ChartState = parsed.ok
          ? { status: "ready", payload: parsed.payload }
          : { status: "invalid", reason: parsed.reason };
        if (isCurrent()) dispatch({ type: "chart", chart, stats: snapshot("data") });
      });
      bus.on("done", () => {
        buffer.flushNow();
        if (isCurrent()) dispatch({ type: "end", phase: "done", stats: snapshot("done") });
      });
      bus.on("error", ({ message }) => {
        buffer.flushNow();
        if (isCurrent()) dispatch({ type: "end", phase: "error", error: message, stats: snapshot("error") });
      });

      const stream = createReplayStream(fixture, {
        signal: controller.signal,
        instant: reducedMotion,
        failAfter,
      });

      pipeToEmitter(readEvents(stream), bus)
        .catch((reason: unknown) => {
          buffer.flushNow();
          if (!isCurrent()) return;
          if (controller.signal.aborted) {
            dispatch({ type: "end", phase: "stopped", stats: snapshot("abort") });
          } else {
            const message = reason instanceof Error ? reason.message : "Stream failed.";
            dispatch({ type: "end", phase: "error", error: message, stats: snapshot("error") });
          }
        })
        .finally(() => {
          buffer.cancel();
          bus.clear();
        });
    },
    [reducedMotion],
  );

  /** Aborts the open stream; whatever has arrived stays on screen, marked stopped. */
  const stop = useCallback(() => controllerRef.current?.abort(), []);

  const regenerate = useCallback(() => {
    if (state.questionId) ask(state.questionId);
  }, [ask, state.questionId]);

  return { state, ask, stop, regenerate, reducedMotion };
}
