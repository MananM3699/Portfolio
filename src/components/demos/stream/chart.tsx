"use client";

import { useEffect, useId, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { ChartColumn, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { ChartPayload, ChartSpec, Units } from "./schema";

/* ---------- formatting ---------- */

const integer = new Intl.NumberFormat("en-US");

function formatValue(value: number, units: Units): string {
  switch (units) {
    case "usd_k":
      return Math.abs(value) >= 1000 ? `$${(value / 1000).toFixed(2)}M` : `$${integer.format(value)}k`;
    case "pct":
      return `${value > 0 ? "+" : value < 0 ? "−" : ""}${Math.abs(value).toFixed(1)}%`;
    case "count":
      return integer.format(value);
  }
}

function formatTick(value: number, units: Units): string {
  switch (units) {
    case "usd_k":
      if (value === 0) return "$0";
      return Math.abs(value) >= 1000 ? `$${value / 1000}M` : `$${value}k`;
    case "pct":
      return `${value < 0 ? "−" : ""}${Math.abs(value)}%`;
    case "count":
      return integer.format(value);
  }
}

/* ---------- scales ---------- */

/** Round tick values (1, 2, 2.5, 5 × 10^n) covering [min, max] in about four steps. */
function niceTicks(min: number, max: number, target = 4): number[] {
  const raw = (max - min || Math.abs(max) || 1) / target;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= raw) ?? raw;
  const ticks: number[] = [];
  for (let v = Math.floor(min / step) * step; v <= Math.ceil(max / step) * step + step / 2; v += step) {
    ticks.push(Number(v.toFixed(6)));
  }
  return ticks;
}

/** Splits a category label into at most two lines of roughly `maxChars`. */
function wrapLabel(label: string, maxChars: number): string[] {
  const lines: string[] = [];
  for (const word of label.split(" ")) {
    const last = lines.at(-1);
    if (last !== undefined && `${last} ${word}`.length <= maxChars) lines[lines.length - 1] = `${last} ${word}`;
    else lines.push(word);
  }
  const clip = (s: string) => (s.length > maxChars ? `${s.slice(0, Math.max(1, maxChars - 1))}…` : s);
  if (lines.length > 2) return [clip(lines[0]), clip(`${lines.slice(1).join(" ")}`)];
  return lines.map(clip);
}

/** Bar with a 4px rounded data end and a square baseline, growing up or down. */
function barPath(x: number, width: number, base: number, end: number, radius = 4): string {
  const r = Math.min(radius, Math.abs(end - base), width / 2);
  const dir = end < base ? 1 : -1; // 1 = bar grows upward
  return [
    `M${x},${base}`,
    `V${end + dir * r}`,
    `Q${x},${end} ${x + r},${end}`,
    `H${x + width - r}`,
    `Q${x + width},${end} ${x + width},${end + dir * r}`,
    `V${base}`,
    "Z",
  ].join(" ");
}

function useElementWidth<T extends HTMLElement>() {
  const [node, setNode] = useState<T | null>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);
  return [setNode, width] as const;
}

/* ---------- chart ---------- */

const HEIGHT = 248;
const AXIS_LABEL_ROOM = 36; // two lines of category labels
const VALUE_LABEL_ROOM = 18;

function describe(chart: ChartSpec): string {
  const values = chart.series[0].values;
  const hi = values.indexOf(Math.max(...values));
  const lo = values.indexOf(Math.min(...values));
  const fmt = (i: number) => `${chart.labels[i]} ${formatValue(values[i], chart.units)}`;
  return `${chart.type === "bar" ? "Bar" : "Line"} chart, ${chart.title}. ${values.length} values. Highest: ${fmt(hi)}. Lowest: ${fmt(lo)}.`;
}

export function StreamChart({ payload }: { payload: ChartPayload }) {
  const { chart, table } = payload;
  const [view, setView] = useState<"chart" | "table">("chart");
  const id = useId();

  return (
    <div className="border border-border bg-surface space-y-3 rounded-md border-border! p-3 sm:p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p id={`${id}-title`} className="text-sm font-medium text-foreground">
            {chart.title}
          </p>
          <p className="font-mono text-[0.7rem] text-muted-foreground">{chart.valueLabel}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={() => setView((v) => (v === "chart" ? "table" : "chart"))}
          aria-pressed={view === "table"}
          className="h-7 shrink-0 gap-1.5 rounded-lg border-border bg-muted/50 px-2.5 font-mono text-[0.7rem] font-normal text-muted-foreground hover:bg-card hover:text-foreground aria-pressed:border-brand/40 aria-pressed:bg-brand-soft aria-pressed:text-brand"
        >
          {view === "chart" ? <Table2 className="size-3.5" aria-hidden /> : <ChartColumn className="size-3.5" aria-hidden />}
          {view === "chart" ? "Show table" : "Show chart"}
        </Button>
      </div>

      {view === "chart" ? <Plot chart={chart} labelledBy={`${id}-title`} /> : <DataTable chart={chart} />}

      {table && (
        <TableFrame>
          <Table className="min-w-[22rem] text-xs">
            <TableCaption className="sr-only">Breakdown for {chart.title}</TableCaption>
            <TableHeader className="bg-muted/60">
              <TableRow className="hover:bg-transparent">
                {table.columns.map((column, i) => (
                  <TableHead key={column} scope="col" className={cn(headCell, i > 0 && "text-right")}>
                    {column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.rows.map((row, r) => (
                <TableRow key={r}>
                  {row.map((cell, i) =>
                    i === 0 ? (
                      <TableHead key={i} scope="row" className={rowHeadCell}>
                        {cell}
                      </TableHead>
                    ) : (
                      <TableCell key={i} className={valueCell}>
                        {cell}
                      </TableCell>
                    ),
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableFrame>
      )}
    </div>
  );
}

const headCell =
  "h-8 px-3 font-mono text-[0.68rem] font-medium uppercase tracking-[0.08em] text-subtle-foreground";
const rowHeadCell = "h-auto px-3 py-2 font-normal whitespace-normal text-foreground";
const valueCell = "px-3 py-2 text-right font-mono tabular-nums text-muted-foreground";

/** Hairline frame around a shadcn Table; the table itself scrolls horizontally when narrow. */
function TableFrame({ children }: { children: ReactNode }) {
  return <div className="overflow-hidden rounded-lg border border-border bg-background/30">{children}</div>;
}

function DataTable({ chart }: { chart: ChartSpec }) {
  const series = chart.series[0];
  return (
    <TableFrame>
      <Table className="text-xs">
        <TableCaption className="sr-only">{chart.title}</TableCaption>
        <TableHeader className="bg-muted/60">
          <TableRow className="hover:bg-transparent">
            <TableHead scope="col" className={headCell}>
              Label
            </TableHead>
            <TableHead scope="col" className={cn(headCell, "text-right")}>
              {chart.valueLabel}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {chart.labels.map((label, i) => (
            <TableRow key={label}>
              <TableHead scope="row" className={cn(rowHeadCell, "py-1.5")}>
                {label}
              </TableHead>
              <TableCell className={cn(valueCell, "py-1.5")}>{formatValue(series.values[i], chart.units)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableFrame>
  );
}

function Plot({ chart, labelledBy }: { chart: ChartSpec; labelledBy: string }) {
  const [measure, width] = useElementWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const descId = useId();
  const summary = describe(chart);

  const values = chart.series[0].values;
  const n = values.length;
  const isBar = chart.type === "bar";
  const hasNegative = values.some((v) => v < 0);

  const ticks = isBar
    ? niceTicks(Math.min(0, ...values), Math.max(0, ...values))
    : niceTicks(Math.min(...values), Math.max(...values));
  const d0 = ticks[0];
  const d1 = ticks[ticks.length - 1];

  const margin = {
    top: VALUE_LABEL_ROOM,
    right: isBar ? 8 : 16,
    bottom: AXIS_LABEL_ROOM + (isBar && hasNegative ? VALUE_LABEL_ROOM : 0),
    left: 44,
  };
  const plotW = Math.max(0, width - margin.left - margin.right);
  const plotH = HEIGHT - margin.top - margin.bottom;
  const y = (v: number) => margin.top + (1 - (v - d0) / (d1 - d0 || 1)) * plotH;

  // Bars sit in equal bands; line points sit on the band edges.
  const band = plotW / n;
  const xCenter = (i: number) => (isBar ? margin.left + band * (i + 0.5) : margin.left + (plotW * i) / Math.max(1, n - 1));
  const barWidth = Math.min(28, band * 0.58);

  // Thin category labels when they would collide (line charts with many points).
  const labelEvery = isBar ? 1 : Math.ceil(n / Math.max(2, Math.floor(plotW / 44)));
  const showLabel = (i: number) => (n - 1 - i) % labelEvery === 0;
  const maxChars = Math.max(4, Math.floor(band / 5.8));

  const baseline = isBar ? y(0) : y(d0);
  const points = values.map((v, i) => [xCenter(i), y(v)] as const);
  const linePath = points.map(([px, py], i) => `${i ? "L" : "M"}${px},${py}`).join(" ");
  const areaPath = `${linePath} L${points[n - 1][0]},${baseline} L${points[0][0]},${baseline} Z`;

  const onPointerMove = (event: PointerEvent<SVGRectElement>) => {
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) return;
    const x = event.clientX - svg.getBoundingClientRect().left - margin.left;
    const i = isBar ? Math.floor(x / band) : Math.round((x / plotW) * (n - 1));
    setActive(Math.min(n - 1, Math.max(0, i)));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, (i: number) => number> = {
      ArrowRight: (i) => Math.min(n - 1, i + 1),
      ArrowLeft: (i) => Math.max(0, i - 1),
      Home: () => 0,
      End: () => n - 1,
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    setActive((i) => (i === null ? 0 : move(i)));
  };

  const tooltipLeft = active === null ? 0 : Math.min(Math.max(xCenter(active), 56), width - 56);
  const tooltipTop = active === null ? 0 : Math.min(y(values[active]), baseline) - 10;

  return (
    <div
      ref={measure}
      className="relative rounded-lg"
      tabIndex={0}
      role="group"
      aria-labelledby={labelledBy}
      aria-describedby={descId}
      onKeyDown={onKeyDown}
      onBlur={() => setActive(null)}
    >
      <p id={descId} className="sr-only">
        Use the left and right arrow keys to read each value, or switch to the table view.
      </p>
      <p className="sr-only" aria-live="polite">
        {active !== null ? `${chart.labels[active]}: ${formatValue(values[active], chart.units)}` : ""}
      </p>

      {width > 0 && (
        <svg width={width} height={HEIGHT} role="img" aria-label={summary} className="block overflow-visible">
          <title>{summary}</title>

          {/* Gridlines and y ticks */}
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={margin.left}
                x2={width - margin.right}
                y1={y(t)}
                y2={y(t)}
                stroke={t === 0 && isBar ? "var(--border-strong)" : "var(--border)"}
                strokeWidth={1}
                shapeRendering="crispEdges"
              />
              <text
                x={margin.left - 8}
                y={y(t)}
                dy="0.32em"
                textAnchor="end"
                className="fill-subtle-foreground font-mono text-[10.5px] tabular-nums"
              >
                {formatTick(t, chart.units)}
              </text>
            </g>
          ))}

          {/* Category labels */}
          {chart.labels.map((label, i) =>
            showLabel(i) ? (
              <text
                key={label}
                x={xCenter(i)}
                y={HEIGHT - AXIS_LABEL_ROOM + 14}
                textAnchor={!isBar && i === n - 1 ? "end" : !isBar && i === 0 ? "start" : "middle"}
                className={cn("text-[11px]", active === i ? "fill-foreground" : "fill-muted-foreground")}
              >
                {wrapLabel(label, isBar ? maxChars : 12).map((line, l) => (
                  <tspan key={l} x={xCenter(i)} dy={l === 0 ? 0 : 13}>
                    {line}
                  </tspan>
                ))}
              </text>
            ) : null,
          )}

          {isBar ? (
            values.map((v, i) => {
              const x = xCenter(i) - barWidth / 2;
              const end = y(v);
              const dimmed = active !== null && active !== i;
              return (
                <g key={chart.labels[i]}>
                  <path
                    d={barPath(x, barWidth, baseline, end)}
                    fill={v < 0 ? "var(--danger)" : "var(--brand)"}
                    className="transition-opacity duration-150"
                    opacity={dimmed ? 0.4 : 1}
                  />
                  <text
                    x={xCenter(i)}
                    y={v < 0 ? end + 13 : end - 6}
                    textAnchor="middle"
                    className="fill-muted-foreground font-mono text-[10.5px] tabular-nums"
                  >
                    {formatValue(v, chart.units)}
                  </text>
                </g>
              );
            })
          ) : (
            <g>
              <path d={areaPath} fill="var(--brand)" fillOpacity={0.1} />
              <path
                d={linePath}
                fill="none"
                stroke="var(--brand)"
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {active !== null && (
                <line
                  x1={points[active][0]}
                  x2={points[active][0]}
                  y1={margin.top}
                  y2={baseline}
                  stroke="var(--border-strong)"
                  strokeWidth={1}
                  shapeRendering="crispEdges"
                />
              )}
              {[n - 1, ...(active !== null && active !== n - 1 ? [active] : [])].map((i) => (
                <circle
                  key={i}
                  cx={points[i][0]}
                  cy={points[i][1]}
                  r={4}
                  fill="var(--brand)"
                  stroke="var(--background)"
                  strokeWidth={2}
                />
              ))}
              <text
                x={points[n - 1][0]}
                y={points[n - 1][1] - 10}
                textAnchor="end"
                className="fill-foreground font-mono text-[10.5px] font-medium tabular-nums"
              >
                {formatValue(values[n - 1], chart.units)}
              </text>
            </g>
          )}

          {/* Hover layer: one hit area over the plot, bigger than any mark. */}
          <rect
            x={margin.left}
            y={margin.top}
            width={plotW}
            height={Math.max(0, plotH)}
            fill="transparent"
            onPointerMove={onPointerMove}
            onPointerLeave={() => setActive(null)}
          />
        </svg>
      )}

      {active !== null && width > 0 && (
        <div
          aria-hidden
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-border-strong bg-popover px-2.5 py-1.5"
          style={{ left: tooltipLeft, top: tooltipTop }}
        >
          <p className="font-mono text-xs font-semibold tabular-nums text-foreground">
            {formatValue(values[active], chart.units)}
          </p>
          <p className="whitespace-nowrap text-[0.7rem] text-muted-foreground">{chart.labels[active]}</p>
        </div>
      )}
    </div>
  );
}
