import { ArrowMarker, Connector, DiagramNode, LaneLabel, NODE_W } from "./diagram";

const COL = [10, 206, 402, 598] as const;
const ROW1 = 36;
const H1 = 60;
const ROW2 = 168;
const H2 = 92;
const MARKER = "solbi-arrow";
const MARKER_LIVE = "solbi-arrow-live";

function Pill({ x, y, label, live = false }: { x: number; y: number; label: string; live?: boolean }) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={NODE_W - 20}
        height={22}
        rx={6}
        className={live ? "fill-brand-soft stroke-brand" : "fill-surface stroke-border-strong"}
      />
      <text
        x={x + (NODE_W - 20) / 2}
        y={y + 15}
        textAnchor="middle"
        fontSize={9.5}
        className={live ? "fill-brand font-mono" : "fill-muted-foreground font-mono"}
      >
        {label}
      </text>
    </g>
  );
}

/**
 * SolBI request pipeline: question in, streamed answer and chart out.
 * Row 1 runs left to right, row 2 returns right to left; a stepped dashed
 * line separates browser from server.
 */
export function SolbiPipelineDiagram() {
  const mid1 = ROW1 + H1 / 2;
  const mid2 = ROW2 + H2 / 2;
  return (
    <svg
      viewBox="0 0 760 292"
      role="img"
      aria-labelledby="solbi-pipe-title solbi-pipe-desc"
      className="h-auto w-full min-w-[640px]"
    >
      <title id="solbi-pipe-title">SolBI streaming pipeline</title>
      <desc id="solbi-pipe-desc">
        A plain-English question goes through a validated query editor to an Express API that stores
        the chat session in MongoDB and calls the LLM. The answer comes back as a Server-Sent Events
        stream, is published on a client-side mitt event bus, and renders progressively: text as it
        streams, then a Plotly chart or Leaflet map once the structured data validates. Answers can be
        saved as dashboards.
      </desc>
      <defs>
        <ArrowMarker id={MARKER} />
        <ArrowMarker id={MARKER_LIVE} highlight />
      </defs>

      <LaneLabel x={10} y={22}>
        BROWSER
      </LaneLabel>
      <LaneLabel x={750} y={22} anchor="end">
        SERVER
      </LaneLabel>

      {/* Row 1: question out */}
      <DiagramNode x={COL[0]} y={ROW1} h={H1} title="Question" sub="plain English" />
      <DiagramNode x={COL[1]} y={ROW1} h={H1} title="Query editor" sub="validated before send" />
      <DiagramNode x={COL[2]} y={ROW1} h={H1} title="Express API" sub="sessions → MongoDB" />
      {/* TODO(manan): name the production LLM provider here if it can be shared. */}
      <DiagramNode x={COL[3]} y={ROW1} h={H1} title="LLM" sub="text + structured data" />
      <Connector d={`M${COL[0] + NODE_W} ${mid1} H${COL[1] - 2}`} marker={MARKER} />
      <Connector d={`M${COL[1] + NODE_W} ${mid1} H${COL[2] - 2}`} marker={MARKER} />
      <Connector d={`M${COL[2] + NODE_W} ${mid1} H${COL[3] - 2}`} marker={MARKER} />

      <Connector d={`M${COL[3] + NODE_W / 2} ${ROW1 + H1} V${ROW2 - 2}`} marker={MARKER} />

      {/* Row 2: answer back, right to left */}
      <DiagramNode x={COL[3]} y={ROW2} h={H2} title="SSE stream" sub="text/event-stream" />
      <DiagramNode x={COL[2]} y={ROW2} h={H2} title="mitt event bus" sub="token + data events" highlight />
      <DiagramNode x={COL[1]} y={ROW2} h={H2} title="Progressive render">
        <Pill x={COL[1] + 10} y={ROW2 + 34} label="1 · text, streaming" live />
        <Pill x={COL[1] + 10} y={ROW2 + 62} label="2 · chart, once valid" />
      </DiagramNode>
      <DiagramNode x={COL[0]} y={ROW2} h={H2} title="Saved dashboards" sub="MongoDB + IndexedDB" />
      {/* The streamed path (SSE → bus → render) is what the replay demo shows. */}
      <Connector d={`M${COL[3]} ${mid2} H${COL[2] + NODE_W + 2}`} marker={MARKER_LIVE} highlight />
      <Connector d={`M${COL[2]} ${mid2} H${COL[1] + NODE_W + 2}`} marker={MARKER_LIVE} highlight />
      <Connector d={`M${COL[1]} ${mid2} H${COL[0] + NODE_W + 2}`} marker={MARKER} />

      {/* Browser / server boundary */}
      <path
        d="M380 10 V132 H576 V280"
        fill="none"
        strokeDasharray="4 4"
        className="stroke-border-strong"
      />
      <LaneLabel x={10} y={284}>
        BROWSER
      </LaneLabel>
      <LaneLabel x={750} y={284} anchor="end">
        SERVER
      </LaneLabel>
    </svg>
  );
}
