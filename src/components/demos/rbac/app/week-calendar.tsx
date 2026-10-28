"use client";

import { useState } from "react";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import type { Shift, TeamWeek } from "../model/contracts";
import { formatDay, leaveTypeLabel } from "../model/format";
import { tagLabel, ATTENDANCE_WEEK, useGetTeamWeekQuery } from "../store/api";
import { ErrorNote, RefetchBadge, SkeletonBar } from "./ui";

type Layer = "leave" | "holidays" | "shifts";

const layerMeta: Record<Layer, { label: string; swatch: string }> = {
  leave: { label: "Team leave", swatch: "bg-success" },
  holidays: { label: "Holidays", swatch: "bg-border-strong" },
  shifts: { label: "Shifts", swatch: "bg-brand" },
};

const shiftHours: Record<Shift, string> = { early: "07–15", day: "09–17", late: "13–21" };

/**
 * Week grid fed by its own query (Attendance:WEEK). It shares no state with the
 * leave table: it only updates after a leave write because the mutation
 * invalidates its tag.
 */
export function WeekCalendar({ title = "This week" }: { title?: string }) {
  const { data, isLoading, isFetching, isError } = useGetTeamWeekQuery();
  const [layers, setLayers] = useState<Record<Layer, boolean>>({ leave: true, holidays: true, shifts: true });

  return (
    <section aria-label={title} className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-foreground">{title}</h4>
          <RefetchBadge active={isFetching && !isLoading} label={tagLabel(ATTENDANCE_WEEK)} />
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Calendar layers">
          {(Object.keys(layerMeta) as Layer[]).map((layer) => (
            <Toggle
              key={layer}
              variant="outline"
              size="sm"
              pressed={layers[layer]}
              onPressedChange={(on) => setLayers((l) => ({ ...l, [layer]: on }))}
              className={cn(
                "h-6 min-w-0 gap-1.5 rounded-md px-2 text-[0.7rem] font-normal transition-colors duration-150",
                "aria-pressed:bg-card data-[state=on]:border-border-strong data-[state=on]:bg-card data-[state=on]:text-foreground",
                "data-[state=off]:border-border data-[state=off]:text-subtle-foreground data-[state=off]:line-through",
              )}
            >
              <span className={cn("size-2 rounded-full", layerMeta[layer].swatch)} aria-hidden />
              {layerMeta[layer].label}
            </Toggle>
          ))}
        </div>
      </div>

      {isError && <ErrorNote>Couldn&apos;t load the week.</ErrorNote>}
      <div className="border border-border bg-surface relative overflow-x-auto rounded-md">
        {isLoading || !data ? (
          <CalendarSkeleton />
        ) : (
          <CalendarGrid week={data} layers={layers} stale={isFetching} />
        )}
      </div>
      <p className="text-[0.68rem] text-subtle-foreground">
        Solid: approved leave. Dashed: pending. Rejected requests don&apos;t occupy the calendar.
      </p>
    </section>
  );
}

function CalendarGrid({ week, layers, stale }: { week: TeamWeek; layers: Record<Layer, boolean>; stale: boolean }) {
  return (
    <table
      className={cn(
        "w-full min-w-lg table-fixed border-collapse text-xs transition-opacity duration-200",
        stale && "opacity-70",
      )}
    >
      <caption className="sr-only">Team week, Monday 2 to Friday 6 November</caption>
      <thead>
        <tr className="border-b border-border bg-muted/60">
          <th scope="col" className="w-28 px-2.5 py-2 text-left font-medium text-muted-foreground">
            Person
          </th>
          {week.days.map((day) => (
            <th
              key={day.date}
              scope="col"
              className="px-1.5 py-2 text-left font-mono text-[0.68rem] font-medium text-muted-foreground"
            >
              {formatDay(day.date)}
              {day.holiday && layers.holidays && (
                <span className="block truncate font-sans text-[0.65rem] font-normal text-subtle-foreground">
                  {day.holiday}
                </span>
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {week.rows.map((row) => (
          <tr key={row.employeeId} className="border-b border-border last:border-b-0">
            <th scope="row" className="truncate px-2.5 py-1.5 text-left font-normal text-foreground">
              {row.name}
            </th>
            {row.cells.map((cell, i) => {
              const holiday = week.days[i]?.holiday;
              return (
                <td key={cell.date} className={cn("h-9 px-1 py-1", holiday && layers.holidays && "bg-muted/60")}>
                  {holiday && layers.holidays ? (
                    <span className="text-[0.68rem] text-subtle-foreground">Holiday</span>
                  ) : cell.leave && layers.leave ? (
                    <span
                      className={cn(
                        "flex h-full items-center truncate rounded px-1.5 text-[0.68rem] font-medium",
                        cell.leave.status === "approved"
                          ? "bg-success-soft text-success"
                          : "border border-dashed border-warning bg-warning-soft text-warning",
                      )}
                    >
                      {leaveTypeLabel[cell.leave.type]}
                      <span className="sr-only"> leave, {cell.leave.status}</span>
                      {cell.leave.status === "pending" && <span aria-hidden>?</span>}
                    </span>
                  ) : layers.shifts ? (
                    <span className="font-mono text-[0.68rem] text-muted-foreground">
                      <span className="sr-only">Shift </span>
                      {shiftHours[cell.shift]}
                    </span>
                  ) : (
                    <span className="sr-only">No layer shown</span>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CalendarSkeleton() {
  return (
    <div className="min-w-lg space-y-3 p-3" role="status" aria-label="Loading week">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="grid grid-cols-6 gap-2">
          {Array.from({ length: 6 }, (_, j) => (
            <SkeletonBar key={j} className={j === 0 ? "w-20" : "w-full"} />
          ))}
        </div>
      ))}
    </div>
  );
}
