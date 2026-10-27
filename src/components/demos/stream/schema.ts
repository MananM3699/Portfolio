import { z } from "zod";

/**
 * Contract for the structured `data` event. The payload arrives over the wire as
 * untyped JSON, so the chart only renders once it parses against this schema.
 */
export const UnitsSchema = z.enum(["usd_k", "pct", "count"]);
export type Units = z.infer<typeof UnitsSchema>;

const SeriesSchema = z.object({
  name: z.string().min(1),
  values: z.array(z.number()),
});

const ChartSchema = z
  .object({
    type: z.enum(["bar", "line"]),
    title: z.string().min(1),
    /** Axis / table heading for the measure, e.g. "Revenue (USD)". */
    valueLabel: z.string().min(1),
    units: UnitsSchema,
    labels: z.array(z.string().min(1)).min(2).max(24),
    // One measure per answer: a second series would need a categorical palette,
    // and the design system deliberately has a single accent hue.
    series: z.array(SeriesSchema).length(1),
  })
  .refine((chart) => chart.series.every((s) => s.values.length === chart.labels.length), {
    message: "each series needs exactly one value per label",
    path: ["series"],
  });

const TableSchema = z
  .object({
    columns: z.array(z.string()).min(1),
    rows: z.array(z.array(z.union([z.string(), z.number()]))),
  })
  .refine((table) => table.rows.every((row) => row.length === table.columns.length), {
    message: "each row needs one cell per column",
    path: ["rows"],
  });

export const ChartPayloadSchema = z.object({
  chart: ChartSchema,
  table: TableSchema.optional(),
});

export type ChartPayload = z.infer<typeof ChartPayloadSchema>;
export type ChartSpec = ChartPayload["chart"];

export type ParseResult =
  | { ok: true; payload: ChartPayload }
  | { ok: false; reason: string };

export function parseChartPayload(input: unknown): ParseResult {
  const result = ChartPayloadSchema.safeParse(input);
  if (result.success) return { ok: true, payload: result.data };
  const issue = result.error.issues[0];
  const where = issue?.path.length ? `${issue.path.join(".")}: ` : "";
  return { ok: false, reason: `${where}${issue?.message ?? "invalid payload"}` };
}
