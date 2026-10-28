/**
 * Static state machine for a wallet transaction. Colours come only from theme
 * tokens (fill-* / stroke-* utilities).
 */

type Node = { id: string; x: number; y: number; label: string; note?: string; terminal?: boolean };

const W = 172;
const STEP = 228; // horizontal distance between columns
const col = (i: number) => 12 + i * STEP;
const TOP = 24;
const BRANCH_Y = TOP + 136;
const H_MAIN = 44;
const H_BRANCH = 56;

const main: Node[] = [
  { id: "idle", x: col(0), y: TOP, label: "idle" },
  { id: "awaiting", x: col(1), y: TOP, label: "awaiting signature" },
  { id: "pending", x: col(2), y: TOP, label: "pending" },
  { id: "confirmed", x: col(3), y: TOP, label: "confirmed", terminal: true },
];

const branches: Node[] = [
  { id: "rejected", x: col(1), y: BRANCH_Y, label: "rejected", note: "declined in wallet", terminal: true },
  { id: "failed", x: col(2), y: BRANCH_Y, label: "failed", note: "reverted on-chain", terminal: true },
  { id: "replaced", x: col(3), y: BRANCH_Y, label: "replaced", note: "sped up: track new hash", terminal: true },
];

const mainEdges = [
  { from: main[0], to: main[1], label: "submit" },
  { from: main[1], to: main[2], label: "signed" },
  { from: main[2], to: main[3], label: "mined" },
];

export function TxLifecycleDiagram() {
  const cy = TOP + H_MAIN / 2;
  return (
    <svg
      viewBox={`0 0 ${col(3) + W + 12} ${BRANCH_Y + H_BRANCH + 12}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-labelledby="tx-title tx-desc"
      className="mx-auto block h-auto w-full max-w-4xl min-w-[680px] font-mono md:min-w-0"
    >
      <title id="tx-title">Transaction lifecycle state machine</title>
      <desc id="tx-desc">
        The happy path runs idle, then awaiting signature, then pending, then confirmed. From
        awaiting signature, the user can reject the request in their wallet. From pending, the
        transaction can fail because the contract reverted, or be replaced when the user speeds it
        up, in which case the interface tracks the new transaction hash.
      </desc>
      <defs>
        <marker
          id="tx-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0 0 L10 5 L0 10 z" className="fill-foreground" />
        </marker>
        <marker
          id="tx-arrow-muted"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0 0 L10 5 L0 10 z" className="fill-subtle-foreground" />
        </marker>
      </defs>

      {/* Happy-path edges */}
      {mainEdges.map(({ from, to, label }) => {
        const x1 = from.x + W + 4;
        const x2 = to.x - 4;
        return (
          <g key={label}>
            <line
              x1={x1}
              y1={cy}
              x2={x2}
              y2={cy}
              className="stroke-foreground"
              strokeWidth={1.5}
              markerEnd="url(#tx-arrow)"
            />
            <text
              x={(x1 + x2) / 2}
              y={cy - 10}
              textAnchor="middle"
              fontSize={11}
              className="fill-muted-foreground"
            >
              {label}
            </text>
          </g>
        );
      })}

      {/* Branch edges: straight down from the source state */}
      {[
        { x: col(1) + W / 2, label: "reject" },
        { x: col(2) + W / 2 - 30, label: "revert" },
      ].map(({ x, label }) => (
        <BranchEdge key={label} x1={x} x2={x} label={label} />
      ))}
      <BranchEdge x1={col(2) + W / 2 + 30} x2={col(3) + W / 2} label="speed up" />

      {[...main, ...branches].map((node) => (
        <StateNode key={node.id} node={node} height={node.y === BRANCH_Y ? H_BRANCH : H_MAIN} />
      ))}
    </svg>
  );
}

function BranchEdge({ x1, x2, label }: { x1: number; x2: number; label: string }) {
  const y1 = TOP + H_MAIN + 4;
  const y2 = BRANCH_Y - 4;
  const diagonal = x1 !== x2;
  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        className="stroke-subtle-foreground"
        strokeWidth={1.25}
        strokeDasharray="4 4"
        markerEnd="url(#tx-arrow-muted)"
      />
      <text
        x={(x1 + x2) / 2 + (diagonal ? 10 : 8)}
        y={(y1 + y2) / 2 + (diagonal ? -6 : 4)}
        fontSize={11}
        className="fill-muted-foreground"
      >
        {label}
      </text>
    </g>
  );
}

function StateNode({ node, height }: { node: Node; height: number }) {
  const cx = node.x + W / 2;
  return (
    <g>
      <rect
        x={node.x}
        y={node.y}
        width={W}
        height={height}
        rx={2}
        className={
          node.terminal
            ? "fill-card stroke-foreground"
            : "fill-transparent stroke-border-strong"
        }
        strokeWidth={node.terminal ? 1.5 : 1}
      />
      {node.terminal && (
        <rect
          x={node.x + 3}
          y={node.y + 3}
          width={W - 6}
          height={height - 6}
          rx={1}
          fill="none"
          className="stroke-foreground/25"
          strokeWidth={1}
        />
      )}
      <text
        x={cx}
        y={node.note ? node.y + 22 : node.y + height / 2 + 4}
        textAnchor="middle"
        fontSize={12.5}
        fontWeight={500}
        className="fill-foreground"
      >
        {node.label}
      </text>
      {node.note && (
        <text
          x={cx}
          y={node.y + 40}
          textAnchor="middle"
          fontSize={10.5}
          className="fill-muted-foreground"
        >
          {node.note}
        </text>
      )}
    </g>
  );
}
