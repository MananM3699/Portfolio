import {
  CreateLeaveRequestSchema,
  LeaveDecisionSchema,
  LeaveListSchema,
  LeaveRequestSchema,
  TeamWeekSchema,
  WEEK_DAYS,
  type CreateLeaveRequest,
  type LeaveDecision,
  type LeaveRequest,
  type Shift,
  type TeamWeek,
} from "./contracts";

/**
 * A tiny in-memory "server" for one playground instance. It owns the rows,
 * derives the attendance week from them (so the calendar is a separate cache
 * entry that genuinely goes stale), and validates both directions with Zod.
 * Everyone here is fictional.
 */

export const LATENCY_MS = 300;

type Employee = { id: string; name: string; shift: Shift };

const employees: Employee[] = [
  { id: "e-asha", name: "Asha Rao", shift: "day" },
  { id: "e-daniel", name: "Daniel Okafor", shift: "day" },
  { id: "e-mei", name: "Mei Lin", shift: "early" },
  { id: "e-tomas", name: "Tomás Ruiz", shift: "late" },
  { id: "e-priya", name: "Priya Nair", shift: "day" },
  { id: "e-jonas", name: "Jonas Weber", shift: "day" },
];

const holidays: Partial<Record<string, string>> = { "2026-11-05": "Founders' Day" };

const seed: LeaveRequest[] = [
  {
    id: "L-101",
    employeeId: "e-daniel",
    employeeName: "Daniel Okafor",
    type: "annual",
    from: "2026-11-03",
    to: "2026-11-04",
    days: 2,
    reason: "Family visit",
    status: "pending",
  },
  {
    id: "L-102",
    employeeId: "e-mei",
    employeeName: "Mei Lin",
    type: "sick",
    from: "2026-11-02",
    to: "2026-11-02",
    days: 1,
    reason: "Flu",
    status: "approved",
  },
  {
    id: "L-103",
    employeeId: "e-asha",
    employeeName: "Asha Rao",
    type: "annual",
    from: "2026-11-06",
    to: "2026-11-06",
    days: 1,
    reason: "Long weekend",
    status: "pending",
  },
  {
    id: "L-104",
    employeeId: "e-tomas",
    employeeName: "Tomás Ruiz",
    type: "comp-off",
    from: "2026-11-06",
    to: "2026-11-06",
    days: 1,
    reason: "Weekend release cover",
    status: "rejected",
  },
];

export class FakeDbError extends Error {
  constructor(
    message: string,
    readonly status: 400 | 404 | 409,
  ) {
    super(message);
  }
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function workingDays(from: string, to: string) {
  return WEEK_DAYS.filter((d) => d >= from && d <= to && !holidays[d]).length;
}

export function createFakeDb() {
  let rows: LeaveRequest[] = seed.map((r) => ({ ...r }));
  let nextId = 105;

  return {
    async listLeave(params: { viewerId: string; scope: "own" | "team" }) {
      await wait(LATENCY_MS);
      const visible = params.scope === "team" ? rows : rows.filter((r) => r.employeeId === params.viewerId);
      return LeaveListSchema.parse(visible);
    },

    async teamWeek(): Promise<TeamWeek> {
      await wait(LATENCY_MS);
      const week: TeamWeek = {
        days: WEEK_DAYS.map((date) => ({ date, holiday: holidays[date] ?? null })),
        rows: employees.map((e) => ({
          employeeId: e.id,
          name: e.name,
          cells: WEEK_DAYS.map((date) => {
            // Rejected requests don't occupy the calendar.
            const leave = rows.find(
              (r) => r.employeeId === e.id && r.status !== "rejected" && r.from <= date && r.to >= date,
            );
            return {
              date,
              shift: e.shift,
              leave: leave ? { requestId: leave.id, type: leave.type, status: leave.status } : null,
            };
          }),
        })),
      };
      return TeamWeekSchema.parse(week);
    },

    async decideLeave(input: LeaveDecision) {
      await wait(LATENCY_MS);
      const { id, decision } = LeaveDecisionSchema.parse(input);
      const row = rows.find((r) => r.id === id);
      if (!row) throw new FakeDbError(`No leave request ${id}`, 404);
      if (row.status !== "pending") throw new FakeDbError(`${id} is already ${row.status}`, 409);
      const updated = { ...row, status: decision };
      rows = rows.map((r) => (r.id === id ? updated : r));
      return LeaveRequestSchema.parse(updated);
    },

    async createLeave(input: CreateLeaveRequest) {
      await wait(LATENCY_MS);
      const parsed = CreateLeaveRequestSchema.safeParse(input);
      if (!parsed.success) throw new FakeDbError("Invalid leave request", 400);
      const { employeeId, request } = parsed.data;
      const employee = employees.find((e) => e.id === employeeId);
      if (!employee) throw new FakeDbError(`Unknown employee ${employeeId}`, 404);
      const days = workingDays(request.from, request.to);
      if (days === 0) throw new FakeDbError("Those dates are all holidays", 400);
      const created: LeaveRequest = {
        id: `L-${nextId++}`,
        employeeId,
        employeeName: employee.name,
        ...request,
        days,
        status: "pending",
      };
      rows = [created, ...rows];
      return LeaveRequestSchema.parse(created);
    },
  };
}

export type FakeDb = ReturnType<typeof createFakeDb>;
