import type { LeaveRequest, LeaveStatus, LeaveType } from "./contracts";

// The demo week is fixed and the playground only renders on the client, so
// formatting with Date here can't cause a hydration mismatch.
const dayFormat = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", timeZone: "UTC" });
const monthFormat = new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "UTC" });

const toDate = (iso: string) => new Date(`${iso}T00:00:00Z`);

/** "Tue 3" */
export const formatDay = (iso: string) => dayFormat.format(toDate(iso));

/** "Tue 3 Nov" or "Tue 3 – Wed 4 Nov" */
export function formatRange(from: string, to: string) {
  const month = monthFormat.format(toDate(to));
  return from === to ? `${formatDay(from)} ${month}` : `${formatDay(from)} – ${formatDay(to)} ${month}`;
}

export const leaveTypeLabel: Record<LeaveType, string> = {
  annual: "Annual",
  sick: "Sick",
  "comp-off": "Comp-off",
  unpaid: "Unpaid",
};

export const statusTone: Record<LeaveStatus, "warning" | "success" | "danger"> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

export const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

export function toCsv(rows: LeaveRequest[]) {
  const header = ["id", "employee", "type", "from", "to", "days", "status", "reason"];
  const escape = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
  const lines = rows.map((r) =>
    [r.id, r.employeeName, r.type, r.from, r.to, r.days, r.status, r.reason].map(escape).join(","),
  );
  return [header.join(","), ...lines].join("\n");
}
