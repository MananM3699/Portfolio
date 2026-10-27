"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { getRoute } from "../model/permissions";
import { LATENCY_MS } from "../model/fake-db";
import type { ActivityEntry, ActivityKind } from "../store/activity-slice";
import { useAppSelector } from "../store/store";

type NodeId = "route" | "guard" | "module" | "rtk" | "tags" | "contract" | "api";
type EdgeId = "route-guard" | "guard-module" | "module-rtk" | "rtk-tags" | "tags-contract" | "contract-api" | "refetch";
type Step = { nodes?: NodeId[]; edges?: EdgeId[]; tone?: "accent" | "danger"; hold?: number };

const STEP_MS = 200;
const REDUCED_HOLD_MS = 1200;

/**
 * Which part of the pipeline each kind of store event travels through.
 * The diagram is driven by the same activity log as the event list, so it
 * only ever animates something that really happened.
 */
const sequences: Partial<Record<ActivityKind, Step[]>> = {
  role: [{ nodes: ["guard"] }, { nodes: ["guard"] }],
  matrix: [{ nodes: ["guard"] }, { nodes: ["guard"] }],
  route: [{ nodes: ["route"] }, { nodes: ["guard"], edges: ["route-guard"] }, { nodes: ["module"], edges: ["guard-module"] }],
  denied: [{ nodes: ["route"] }, { nodes: ["guard"], edges: ["route-guard"], tone: "danger" }, { nodes: ["guard"], tone: "danger" }],
  mutation: [
    { nodes: ["module"] },
    { nodes: ["rtk"], edges: ["module-rtk"] },
    { nodes: ["tags"], edges: ["rtk-tags"] },
    { nodes: ["contract"], edges: ["tags-contract"] },
    { nodes: ["api"], edges: ["contract-api"] },
  ],
  invalidated: [{ nodes: ["contract"], edges: ["contract-api"] }, { nodes: ["tags"], edges: ["tags-contract"] }],
  refetch: [{ nodes: ["tags"] }, { nodes: ["rtk"], edges: ["refetch"] }],
  resolved: [{ nodes: ["rtk"] }, { nodes: ["module"], edges: ["module-rtk"] }],
};

const NODE_W = 216;
const NODE_H = 44;
const GAP = 20;
const X = 16;
const CX = X + NODE_W / 2;
const nodeY = (i: number) => 8 + i * (NODE_H + GAP);

const ORDER: NodeId[] = ["route", "guard", "module", "rtk", "tags", "contract", "api"];
const LINKS: [EdgeId, NodeId, NodeId][] = [
  ["route-guard", "route", "guard"],
  ["guard-module", "guard", "module"],
  ["module-rtk", "module", "rtk"],
  ["rtk-tags", "rtk", "tags"],
  ["tags-contract", "tags", "contract"],
  ["contract-api", "contract", "api"],
];

function usePipelineHighlight(entries: ActivityEntry[]) {
  const [current, setCurrent] = useState<Step | null>(null);
  const queue = useRef<Step[]>([]);
  const lastSeen = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const seenAt = entries.findIndex((e) => e.id === lastSeen.current);
    const fresh = entries.slice(seenAt + 1);
    if (fresh.length === 0) return;
    lastSeen.current = fresh[fresh.length - 1].id;

    const steps = fresh.flatMap((e) => sequences[e.kind] ?? []);
    if (steps.length === 0) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // No travelling highlight: light the whole path once, then fade.
      queue.current = [
        {
          nodes: [...new Set(steps.flatMap((s) => s.nodes ?? []))],
          edges: [...new Set(steps.flatMap((s) => s.edges ?? []))],
          tone: steps.some((s) => s.tone === "danger") ? "danger" : "accent",
          hold: REDUCED_HOLD_MS,
        },
      ];
    } else {
      queue.current.push(...steps);
    }

    const drain = () => {
      const next = queue.current.shift() ?? null;
      setCurrent(next);
      timer.current = next ? setTimeout(drain, next.hold ?? STEP_MS) : null;
    };
    if (!timer.current) timer.current = setTimeout(drain, 0);
  }, [entries]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return current;
}

export function ArchitectureDiagram() {
  const entries = useAppSelector((s) => s.activity.entries);
  const route = getRoute(useAppSelector((s) => s.session.route));
  const step = usePipelineHighlight(entries);
  const titleId = useId();
  const descId = useId();

  const nodes: Record<NodeId, { label: string; detail: string }> = {
    route: { label: "Route", detail: route.path },
    guard: { label: "RBAC guard", detail: `can("${route.requires}")` },
    module: { label: `Module (${route.label})`, detail: "<Can> · usePermission" },
    rtk: { label: "RTK Query slice", detail: "hrmsApi" },
    tags: { label: "Cache tags", detail: "Leave:LIST · Attendance:WEEK" },
    contract: { label: "Zod contract", detail: "LeaveRequestSchema.parse" },
    api: { label: "API", detail: `fake DB · ${LATENCY_MS}ms` },
  };

  const isOn = (id: NodeId | EdgeId) =>
    Boolean(step?.nodes?.includes(id as NodeId) || step?.edges?.includes(id as EdgeId));
  const danger = step?.tone === "danger";

  const tagsY = nodeY(ORDER.indexOf("tags")) + NODE_H / 2;
  const rtkY = nodeY(ORDER.indexOf("rtk")) + NODE_H / 2;
  const arcX = X + NODE_W;
  const height = nodeY(ORDER.length - 1) + NODE_H + 8;

  return (
    <figure className="space-y-3">
      <div>
        <h4 className="text-sm font-medium text-foreground">Request path</h4>
        <p className="text-xs text-muted-foreground">Lights up as the store events above happen.</p>
      </div>
      <div className="glass-subtle rounded-xl p-3">
        <svg
          viewBox={`0 0 320 ${height}`}
          role="img"
          aria-labelledby={`${titleId} ${descId}`}
          className="mx-auto block w-full max-w-80"
        >
          <title id={titleId}>Architecture of the leave module</title>
          <desc id={descId}>
            A route passes an RBAC guard before the Leave module renders. The module reads and writes through an RTK
            Query slice whose cache tags decide what refetches. Responses are parsed by a Zod contract at the API
            boundary. A mutation invalidates Leave:LIST and Attendance:WEEK, which triggers a refetch.
          </desc>

          {LINKS.map(([id, from, to]) => {
            const y1 = nodeY(ORDER.indexOf(from)) + NODE_H;
            const y2 = nodeY(ORDER.indexOf(to));
            const on = isOn(id);
            return (
              <g
                key={id}
                className={cn(
                  "transition-colors duration-200",
                  on ? (danger ? "text-danger" : "text-brand") : "text-border-strong",
                )}
              >
                <line x1={CX} y1={y1} x2={CX} y2={y2 - 4} stroke="currentColor" strokeWidth={on ? 2 : 1} />
                <path d={`M${CX - 4} ${y2 - 6} L${CX} ${y2} L${CX + 4} ${y2 - 6} Z`} fill="currentColor" />
              </g>
            );
          })}

          {/* Invalidation loop: tags back up to the query slice, which refetches. */}
          <g
            className={cn(
              "transition-colors duration-200",
              isOn("refetch") ? "text-brand" : "text-border-strong",
            )}
          >
            <path
              d={`M${arcX} ${tagsY} C ${arcX + 44} ${tagsY}, ${arcX + 44} ${rtkY}, ${arcX + 6} ${rtkY}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={isOn("refetch") ? 2 : 1}
              strokeDasharray="4 3"
            />
            <path d={`M${arcX + 7} ${rtkY - 4} L${arcX} ${rtkY} L${arcX + 7} ${rtkY + 4} Z`} fill="currentColor" />
            <text
              x={arcX + 40}
              y={(tagsY + rtkY) / 2 + 3}
              className="fill-current font-mono"
              fontSize={9}
            >
              refetch
            </text>
          </g>

          {ORDER.map((id, i) => {
            const y = nodeY(i);
            const on = isOn(id);
            return (
              <g key={id}>
                <rect
                  x={X}
                  y={y}
                  width={NODE_W}
                  height={NODE_H}
                  rx={8}
                  strokeWidth={on ? 1.5 : 1}
                  style={on ? { filter: `drop-shadow(0 0 6px ${danger ? "var(--danger)" : "var(--brand)"})` } : undefined}
                  className={cn(
                    "transition-colors duration-200",
                    on
                      ? danger
                        ? "fill-danger-soft stroke-danger"
                        : "fill-brand-soft stroke-brand"
                      : "fill-card stroke-border-strong",
                  )}
                />
                <text x={X + 12} y={y + 18} fontSize={12} fontWeight={500} className="fill-foreground">
                  {nodes[id].label}
                </text>
                <text
                  x={X + 12}
                  y={y + 34}
                  fontSize={10}
                  className={cn("font-mono transition-colors duration-200", on && danger ? "fill-danger" : "fill-muted-foreground")}
                >
                  {id === "guard" && on && danger ? "403 · missing permission" : nodes[id].detail}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="text-[0.68rem] text-muted-foreground">
        Switch role to pulse the guard; approve a request to watch mutation → tags → refetch.
      </figcaption>
    </figure>
  );
}
