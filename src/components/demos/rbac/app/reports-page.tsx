"use client";

import { cn } from "@/lib/cn";
import type { LeaveStatus } from "../model/contracts";
import { LEAVE_LIST, tagLabel } from "../store/api";
import { useVisibleLeave } from "./leave-page";
import { ErrorNote, PageHeader, RefetchBadge, SkeletonBar } from "./ui";

const tileClass =
  "glass-subtle rounded-xl p-3.5 transition-[translate,border-color] duration-200 hover:-translate-y-0.5 hover:border-border-strong";

const tiles: { status: LeaveStatus; label: string; tone: string }[] = [
  { status: "pending", label: "Pending", tone: "text-warning" },
  { status: "approved", label: "Approved", tone: "text-success" },
  { status: "rejected", label: "Rejected", tone: "text-danger" },
];

/** Derived from the Leave:LIST cache entry: no extra endpoint, and it updates with the table. */
export function ReportsPage() {
  const { data, isLoading, isFetching, isError } = useVisibleLeave();
  const daysApproved = data?.filter((r) => r.status === "approved").reduce((sum, r) => sum + r.days, 0) ?? 0;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Reports"
        description="Leave this week, computed from the cached list"
        actions={<RefetchBadge active={isFetching && !isLoading} label={tagLabel(LEAVE_LIST)} />}
      />
      {isError && <ErrorNote>Couldn&apos;t load the report.</ErrorNote>}
      <dl className="grid grid-cols-2 gap-2.5 @lg:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.status} className={tileClass}>
            <dt className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-subtle-foreground">
              {tile.label}
            </dt>
            <dd className={cn("mt-1 font-mono text-2xl font-semibold", tile.tone)}>
              {data ? data.filter((r) => r.status === tile.status).length : <SkeletonBar className="mt-2 w-8" />}
            </dd>
          </div>
        ))}
        <div className={tileClass}>
          <dt className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-subtle-foreground">
            Days off
          </dt>
          <dd className="mt-1 font-mono text-2xl font-semibold text-foreground">
            {data ? daysApproved : <SkeletonBar className="mt-2 w-8" />}
          </dd>
        </div>
      </dl>
    </div>
  );
}
