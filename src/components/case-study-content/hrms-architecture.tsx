import { ArrowMarker, Connector, DiagramNode, LaneLabel, NODE_W } from "./diagram";

const COL = [10, 206, 402, 598] as const;
const ROW1 = 36;
const ROW2 = 168;
const H = 60;
const MARKER = "hrms-arrow";

/**
 * Request lifecycle through the HRMS frontend, from route to database.
 * Static, server-rendered SVG; every colour is a design token.
 */
export function HrmsArchitectureDiagram() {
  const mid1 = ROW1 + H / 2;
  const mid2 = ROW2 + H / 2;
  return (
    <svg
      viewBox="0 0 760 262"
      role="img"
      aria-labelledby="hrms-arch-title hrms-arch-desc"
      className="h-auto w-full min-w-[640px]"
    >
      <title id="hrms-arch-title">HRMS frontend request lifecycle</title>
      <desc id="hrms-arch-desc">
        Eight steps in order: Route, RBAC guard, Module, RTK Query slice, cache tags, Zod contract,
        REST API, database. The first four run in the browser; the Zod contract is shared; the REST
        API and database are on the server side of an HTTP boundary. The RBAC guard and the cache
        tags are highlighted because the playground on this page shows them live.
      </desc>
      <defs>
        <ArrowMarker id={MARKER} />
      </defs>

      <LaneLabel x={10} y={22}>
        BROWSER · REACT + TYPESCRIPT
      </LaneLabel>
      <rect x={528} y={14} width={9} height={9} rx={2} className="fill-brand-soft stroke-brand" />
      <LaneLabel x={750} y={22} anchor="end">
        SHOWN LIVE IN THE PLAYGROUND
      </LaneLabel>

      {/* Row 1: browser */}
      <DiagramNode x={COL[0]} y={ROW1} title="Route" sub="URL → page" />
      <DiagramNode x={COL[1]} y={ROW1} title="RBAC guard" sub="can(permission)?" highlight />
      <DiagramNode x={COL[2]} y={ROW1} title="Module" sub="Leave, Attendance, …" />
      <DiagramNode x={COL[3]} y={ROW1} title="RTK Query slice" sub="endpoints + hooks" />
      <Connector d={`M${COL[0] + NODE_W} ${mid1} H${COL[1] - 2}`} marker={MARKER} />
      <Connector d={`M${COL[1] + NODE_W} ${mid1} H${COL[2] - 2}`} marker={MARKER} />
      <Connector d={`M${COL[2] + NODE_W} ${mid1} H${COL[3] - 2}`} marker={MARKER} />

      {/* Wrap from the end of row 1 to the start of row 2 */}
      <Connector
        d={`M${COL[3] + NODE_W / 2} ${ROW1 + H} V132 H${COL[0] + NODE_W / 2} V${ROW2 - 2}`}
        marker={MARKER}
      />

      {/* Row 2: contract + server */}
      <DiagramNode x={COL[0]} y={ROW2} title="Cache tags" sub="provides / invalidates" highlight />
      <DiagramNode x={COL[1]} y={ROW2} title="Zod contract" sub="parse in, parse out" />
      <DiagramNode x={COL[2]} y={ROW2} title="REST API" sub="business rules" />
      <DiagramNode x={COL[3]} y={ROW2} title="Database" sub="co-designed schema" />
      <Connector d={`M${COL[0] + NODE_W} ${mid2} H${COL[1] - 2}`} marker={MARKER} />
      <Connector d={`M${COL[1] + NODE_W} ${mid2} H${COL[2] - 2}`} marker={MARKER} />
      <Connector d={`M${COL[2] + NODE_W} ${mid2} H${COL[3] - 2}`} marker={MARKER} />

      {/* HTTP boundary between the shared contract and the server */}
      <line
        x1={380}
        y1={150}
        x2={380}
        y2={256}
        strokeDasharray="4 4"
        className="stroke-border-strong"
      />
      <LaneLabel x={10} y={252}>
        BROWSER · SHARED SCHEMAS
      </LaneLabel>
      <LaneLabel x={750} y={252} anchor="end">
        SERVER
      </LaneLabel>
    </svg>
  );
}
