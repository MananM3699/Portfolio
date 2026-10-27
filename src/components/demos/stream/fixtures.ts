/**
 * Recorded answers for the replay. Everything here is fictional: "Larchmere Outdoor"
 * is a made-up retailer and every number is mock data.
 */

export type Chunk = { text: string; delayMs: number };

export type QuestionId = "revenue-by-region" | "declining-lines" | "repeat-orders";

export type Fixture = {
  id: QuestionId;
  question: string;
  /** Pause before the first token, standing in for query planning. */
  firstTokenMs: number;
  chunks: Chunk[];
  /** Pause between the last token and the structured `data` event. */
  payloadDelayMs: number;
  /**
   * Typed as `unknown` on purpose: it travels as JSON, and the UI must validate it
   * (see schema.ts) before trusting its shape.
   */
  payload: unknown;
  /** If set, the first run of this question fails after this many chunks. */
  failOnFirstRunAfter?: number;
};

/**
 * Splits the final answer into word-sized chunks with a deterministic cadence:
 * a little jitter per token and longer pauses after commas and sentence ends.
 * Generating the timings keeps this file readable; a raw capture would be hundreds
 * of near-identical lines.
 */
function record(text: string, seed: number): Chunk[] {
  const words = text.match(/\S+\s*/g) ?? [];
  return words.map((word, i) => {
    const jitter = ((i * 7 + seed) % 5) * 8;
    const pause = /[.!?]\s*$/.test(word) ? 140 : /,\s*$/.test(word) ? 50 : 0;
    return { text: word, delayMs: 16 + jitter + pause };
  });
}

export const fixtures: Fixture[] = [
  {
    id: "revenue-by-region",
    question: "Revenue by region last quarter",
    firstTokenMs: 420,
    payloadDelayMs: 260,
    chunks: record(
      "Larchmere Outdoor booked $1.90M in revenue last quarter across five regions. " +
        "East led with $538k, about 28% of the total, followed by West at $466k. " +
        "Central was the smallest region at $194k, roughly 10% of revenue. " +
        "The chart below breaks it down by region.",
      3,
    ),
    payload: {
      chart: {
        type: "bar",
        title: "Revenue by region, last quarter",
        valueLabel: "Revenue (USD)",
        units: "usd_k",
        labels: ["North", "South", "East", "West", "Central"],
        series: [{ name: "Revenue", values: [412, 287, 538, 466, 194] }],
      },
    },
  },
  {
    id: "declining-lines",
    question: "Which product lines are declining?",
    firstTokenMs: 480,
    payloadDelayMs: 300,
    failOnFirstRunAfter: 23,
    chunks: record(
      "Three of the five largest product lines declined quarter over quarter. " +
        "Base layers fell the most, down 19.1% from $188k to $152k. " +
        "Rain shells dropped 10.8% and camp kitchen slipped 6.0%. " +
        "Trail footwear (+12.3%) and daypacks (+6.8%) grew, so the decline is concentrated rather than across the board.",
      1,
    ),
    payload: {
      chart: {
        type: "bar",
        title: "Change in revenue, last quarter vs. the one before",
        valueLabel: "Change (%)",
        units: "pct",
        labels: ["Trail footwear", "Rain shells", "Camp kitchen", "Daypacks", "Base layers"],
        series: [{ name: "Change", values: [12.3, -10.8, -6.0, 6.8, -19.1] }],
      },
      table: {
        columns: ["Product line", "Previous quarter", "Last quarter", "Change"],
        rows: [
          ["Trail footwear", "$310k", "$348k", "+12.3%"],
          ["Rain shells", "$240k", "$214k", "−10.8%"],
          ["Camp kitchen", "$150k", "$141k", "−6.0%"],
          ["Daypacks", "$205k", "$219k", "+6.8%"],
          ["Base layers", "$188k", "$152k", "−19.1%"],
        ],
      },
    },
  },
  {
    id: "repeat-orders",
    question: "Weekly repeat orders this quarter",
    firstTokenMs: 380,
    payloadDelayMs: 240,
    chunks: record(
      "Repeat orders rose steadily this quarter, from 182 in week 1 to 271 in week 13, an increase of about 49%. " +
        "The only notable dip was week 3 at 176, the lowest week of the quarter. " +
        "Every week from week 7 onward stayed above 225.",
      4,
    ),
    payload: {
      chart: {
        type: "line",
        title: "Repeat orders per week, this quarter",
        valueLabel: "Repeat orders",
        units: "count",
        labels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11", "W12", "W13"],
        series: [
          { name: "Repeat orders", values: [182, 190, 176, 205, 214, 209, 231, 226, 240, 252, 247, 263, 271] },
        ],
      },
    },
  },
];

export function getFixture(id: QuestionId): Fixture {
  const fixture = fixtures.find((f) => f.id === id);
  if (!fixture) throw new Error(`Unknown question: ${id}`);
  return fixture;
}
