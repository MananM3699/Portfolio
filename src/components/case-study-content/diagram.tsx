import type { ReactNode } from "react";

/*
 * Small SVG building blocks shared by the case-study diagrams.
 * Colours come only from design tokens (Tailwind fill-/stroke- token classes), so both themes
 * work without hard-coded hex values. On the glass figure: nodes fill with --card, edges use
 * --border-strong, and anything the page's demo shows live uses --brand.
 */

export const NODE_W = 152;

export function DiagramNode({
  x,
  y,
  w = NODE_W,
  h = 60,
  title,
  sub,
  highlight = false,
  children,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  title: string;
  sub?: string;
  highlight?: boolean;
  children?: ReactNode;
}) {
  const cx = x + w / 2;
  // With extra children (e.g. pills) the text sits at the top; otherwise centred.
  const titleY = children ? y + 22 : sub ? y + h / 2 - 3 : y + h / 2 + 4;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={10}
        strokeWidth={1}
        shapeRendering="geometricPrecision"
        className={highlight ? "fill-brand-soft stroke-brand" : "fill-card stroke-border-strong"}
      />
      <text
        x={cx}
        y={titleY}
        textAnchor="middle"
        fontSize={13}
        fontWeight={600}
        className="fill-foreground"
      >
        {title}
      </text>
      {sub && (
        <text
          x={cx}
          y={titleY + 17}
          textAnchor="middle"
          fontSize={10}
          className="fill-muted-foreground font-mono"
        >
          {sub}
        </text>
      )}
      {children}
    </g>
  );
}

/** Arrowhead marker; pass a diagram-unique id. `highlight` draws it in the brand colour. */
export function ArrowMarker({ id, highlight = false }: { id: string; highlight?: boolean }) {
  return (
    <marker
      id={id}
      viewBox="0 0 10 10"
      refX={9}
      refY={5}
      markerWidth={7}
      markerHeight={7}
      orient="auto-start-reverse"
    >
      <path d="M0 1 L9 5 L0 9 z" className={highlight ? "fill-brand" : "fill-muted-foreground"} />
    </marker>
  );
}

/** Arrowed path. A highlighted connector marks the path the page's demo shows live; pair it
 * with a highlighted ArrowMarker. */
export function Connector({
  d,
  marker,
  highlight = false,
}: {
  d: string;
  marker: string;
  highlight?: boolean;
}) {
  return (
    <path
      d={d}
      fill="none"
      strokeWidth={highlight ? 1.75 : 1.25}
      strokeLinejoin="round"
      className={highlight ? "stroke-brand" : "stroke-muted-foreground"}
      markerEnd={`url(#${marker})`}
    />
  );
}

export function LaneLabel({
  x,
  y,
  anchor = "start",
  children,
}: {
  x: number;
  y: number;
  anchor?: "start" | "end" | "middle";
  children: string;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={10}
      letterSpacing="0.12em"
      className="fill-subtle-foreground font-mono"
    >
      {children}
    </text>
  );
}
