import { z } from "zod";

/**
 * API contracts. The fake server parses everything it returns and everything it
 * receives against these schemas, the same way the real client validates the
 * boundary instead of trusting `as LeaveRequest` casts.
 */

export const WEEK_DAYS = ["2026-11-02", "2026-11-03", "2026-11-04", "2026-11-05", "2026-11-06"] as const;
export const WEEK_START = WEEK_DAYS[0];
export const WEEK_END = WEEK_DAYS[WEEK_DAYS.length - 1];

const isoDate = z.iso.date();

export const LeaveTypeSchema = z.enum(["annual", "sick", "comp-off", "unpaid"]);
export type LeaveType = z.infer<typeof LeaveTypeSchema>;

const LeaveStatusSchema = z.enum(["pending", "approved", "rejected"]);
export type LeaveStatus = z.infer<typeof LeaveStatusSchema>;

export const LeaveRequestSchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  employeeName: z.string(),
  type: LeaveTypeSchema,
  from: isoDate,
  to: isoDate,
  days: z.number().int().positive(),
  reason: z.string(),
  status: LeaveStatusSchema,
});
export type LeaveRequest = z.infer<typeof LeaveRequestSchema>;
export const LeaveListSchema = z.array(LeaveRequestSchema);

const ShiftSchema = z.enum(["early", "day", "late"]);
export type Shift = z.infer<typeof ShiftSchema>;

export const TeamWeekSchema = z.object({
  days: z.array(z.object({ date: isoDate, holiday: z.string().nullable() })),
  rows: z.array(
    z.object({
      employeeId: z.string(),
      name: z.string(),
      cells: z.array(
        z.object({
          date: isoDate,
          shift: ShiftSchema,
          leave: z
            .object({ requestId: z.string(), type: LeaveTypeSchema, status: LeaveStatusSchema })
            .nullable(),
        }),
      ),
    }),
  ),
});
export type TeamWeek = z.infer<typeof TeamWeekSchema>;

export const LeaveDecisionSchema = z.object({
  id: z.string(),
  decision: z.enum(["approved", "rejected"]),
});
export type LeaveDecision = z.infer<typeof LeaveDecisionSchema>;

const demoWeekDate = z
  .string()
  .min(1, "Pick a date")
  .pipe(isoDate)
  .refine((d) => d >= WEEK_START && d <= WEEK_END, "Pick a weekday in the demo week (2–6 Nov)");

/** Shared by the form (inline errors) and the fake server (rejects bad input). */
export const NewLeaveRequestSchema = z
  .object({
    type: LeaveTypeSchema,
    from: demoWeekDate,
    to: demoWeekDate,
    reason: z
      .string()
      .trim()
      .min(10, "Add a short reason (at least 10 characters)")
      .max(140, "Keep the reason under 140 characters"),
  })
  .refine((v) => v.to >= v.from, { message: "End date can't be before the start date", path: ["to"] });
export type NewLeaveRequest = z.infer<typeof NewLeaveRequestSchema>;

export const CreateLeaveRequestSchema = z.object({
  employeeId: z.string(),
  request: NewLeaveRequestSchema,
});
export type CreateLeaveRequest = z.infer<typeof CreateLeaveRequestSchema>;
