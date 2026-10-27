"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/cn";
import type { TeamWeek } from "../model/contracts";
import { formatDay } from "../model/format";
import { ATTENDANCE_WEEK, tagLabel, useGetTeamWeekQuery } from "../store/api";
import { ErrorNote, headCellClass, headRowClass, PageHeader, paneClass, RefetchBadge, SkeletonBar } from "./ui";

type Mark = { code: string; label: string; tone: string };

function markFor(cell: TeamWeek["rows"][number]["cells"][number], holiday: string | null): Mark {
  if (holiday) return { code: "H", label: `Holiday: ${holiday}`, tone: "text-subtle-foreground" };
  if (cell.leave?.status === "approved") return { code: "L", label: "On leave", tone: "text-success" };
  if (cell.leave?.status === "pending") return { code: "P?", label: "Scheduled, leave pending", tone: "text-warning" };
  return { code: "S", label: "Scheduled", tone: "text-foreground" };
}

/** Reads the same Attendance:WEEK cache entry as the calendar: one request, two views. */
export function AttendancePage() {
  const { data, isLoading, isFetching, isError } = useGetTeamWeekQuery();

  return (
    <div className="space-y-4">
      <PageHeader
        title="Attendance"
        description="Scheduled days this week. Approved leave and holidays come off the count."
        actions={<RefetchBadge active={isFetching && !isLoading} label={tagLabel(ATTENDANCE_WEEK)} />}
      />
      {isError && <ErrorNote>Couldn&apos;t load attendance.</ErrorNote>}
      <div className={paneClass}>
        {isLoading || !data ? (
          <div className="space-y-3 p-3" role="status" aria-label="Loading attendance">
            {Array.from({ length: 5 }, (_, i) => (
              <SkeletonBar key={i} className="w-full" />
            ))}
          </div>
        ) : (
          <Table className="min-w-lg text-left text-xs">
            <caption className="sr-only">Attendance for the week of 2 November</caption>
            <TableHeader>
              <TableRow className={headRowClass}>
                <TableHead scope="col" className={headCellClass}>Employee</TableHead>
                {data.days.map((d) => (
                  <TableHead
                    key={d.date}
                    scope="col"
                    className={cn(headCellClass, "px-2 text-center font-mono text-[0.68rem]")}
                  >
                    {formatDay(d.date)}
                  </TableHead>
                ))}
                <TableHead scope="col" className={cn(headCellClass, "text-right")}>Working days</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.rows.map((row) => {
                const marks = row.cells.map((cell, i) => markFor(cell, data.days[i]?.holiday ?? null));
                const working = marks.filter((m) => m.code === "S" || m.code === "P?").length;
                return (
                  <TableRow key={row.employeeId}>
                    <TableHead scope="row" className="h-auto px-3 py-2 font-normal text-foreground">
                      {row.name}
                    </TableHead>
                    {marks.map((mark, i) => (
                      <TableCell key={row.cells[i]?.date} className="px-2 py-2 text-center">
                        <span className={cn("font-mono text-[0.7rem]", mark.tone)} title={mark.label}>
                          <span aria-hidden>{mark.code}</span>
                          <span className="sr-only">{mark.label}</span>
                        </span>
                      </TableCell>
                    ))}
                    <TableCell className="px-3 py-2 text-right font-mono text-foreground">{working}/5</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
      <p className="font-mono text-[0.65rem] text-subtle-foreground">
        S scheduled · L on leave · P? leave pending · H holiday
      </p>
    </div>
  );
}
