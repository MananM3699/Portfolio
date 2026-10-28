"use client";

import { useState } from "react";
import { Check, Download, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { LeaveRequest } from "../model/contracts";
import { formatRange, leaveTypeLabel, toCsv } from "../model/format";
import { Can, GuardedButton, usePermission, useViewer } from "../guard";
import { LEAVE_LIST, tagLabel, useDecideLeaveMutation, useGetLeaveRequestsQuery } from "../store/api";
import { RequestLeaveForm } from "./request-leave-form";
import { WeekCalendar } from "./week-calendar";
import {
  appButtonSkin,
  ErrorNote,
  headCellClass,
  headRowClass,
  PageHeader,
  paneClass,
  RefetchBadge,
  SkeletonBar,
  StatusChip,
} from "./ui";

/** Shared by Leave and Reports: the server scopes rows by what the viewer may see. */
export function useVisibleLeave() {
  const { personaId } = useViewer();
  const seesTeam = usePermission("leave:view-team");
  const query = useGetLeaveRequestsQuery({ viewerId: personaId, scope: seesTeam ? "team" : "own" });
  return { ...query, seesTeam };
}

export function LeavePage() {
  const { data, isLoading, isFetching, isError, seesTeam } = useVisibleLeave();
  const canApprove = usePermission("leave:approve");
  const [formOpen, setFormOpen] = useState(false);

  function exportCsv() {
    if (!data) return;
    const url = URL.createObjectURL(new Blob([toCsv(data)], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "hrms-leave.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Leave requests"
        description={seesTeam ? "Everyone on the team" : "Only your own requests (no leave:view-team)"}
        actions={
          <>
            <Can permission="leave:request">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFormOpen((open) => !open)}
                aria-expanded={formOpen}
                className={appButtonSkin.outline}
              >
                <Plus aria-hidden /> Request leave
              </Button>
            </Can>
            <GuardedButton permission="leave:export" actionName="Export CSV" onClick={exportCsv}>
              {/* The lock icon replaces this one when the action is locked. */}
              <Can permission="leave:export">
                <Download aria-hidden />
              </Can>
              Export CSV
            </GuardedButton>
          </>
        }
      />

      {formOpen && (
        <Can permission="leave:request">
          <RequestLeaveForm onDone={() => setFormOpen(false)} />
        </Can>
      )}

      <div className="space-y-2">
        <div className="flex h-4 items-center justify-end">
          <RefetchBadge active={isFetching && !isLoading} label={tagLabel(LEAVE_LIST)} />
        </div>
        {isError && <ErrorNote>Couldn&apos;t load leave requests.</ErrorNote>}
        <div className={paneClass}>
          <Table className="min-w-lg text-left text-xs">
            <caption className="sr-only">Leave requests</caption>
            <TableHeader>
              <TableRow className={headRowClass}>
                <TableHead scope="col" className={headCellClass}>Employee</TableHead>
                <TableHead scope="col" className={headCellClass}>Dates</TableHead>
                <TableHead scope="col" className={headCellClass}>Type</TableHead>
                <TableHead scope="col" className={headCellClass}>Status</TableHead>
                {canApprove && (
                  <TableHead scope="col" className={cn(headCellClass, "text-right")}>
                    Actions
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody className={isFetching && !isLoading ? "opacity-70 transition-opacity duration-200" : undefined}>
              {isLoading || !data ? (
                <SkeletonRows columns={canApprove ? 5 : 4} />
              ) : data.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={canApprove ? 5 : 4} className="px-3 py-6 text-center text-muted-foreground">
                    No leave requests yet.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((request) => (
                  <LeaveRow key={request.id} request={request} canApprove={canApprove} refreshing={isFetching} />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Can permission="calendar:view">
        <WeekCalendar />
      </Can>
    </div>
  );
}

/**
 * Each row owns its mutation hook, so two decisions in flight don't share a spinner.
 * Actions stay disabled until the invalidated list has refetched: no optimistic
 * update here on purpose, the demo is about watching the cache round-trip.
 */
function LeaveRow({
  request,
  canApprove,
  refreshing,
}: {
  request: LeaveRequest;
  canApprove: boolean;
  refreshing: boolean;
}) {
  const [decide, { isLoading, originalArgs }] = useDecideLeaveMutation();
  const deciding = isLoading ? originalArgs?.decision : undefined;
  const busy = isLoading || refreshing;

  return (
    <TableRow>
      <TableCell className="px-3 py-2.5">
        <span className="font-medium text-foreground">{request.employeeName}</span>
        <span className="block font-mono text-[0.65rem] text-subtle-foreground">{request.id}</span>
      </TableCell>
      <TableCell className="px-3 py-2.5 text-foreground">
        {formatRange(request.from, request.to)}
        <span className="block text-[0.68rem] text-subtle-foreground">
          {request.days} {request.days === 1 ? "day" : "days"}
        </span>
      </TableCell>
      <TableCell className="px-3 py-2.5 text-muted-foreground">{leaveTypeLabel[request.type]}</TableCell>
      <TableCell className="px-3 py-2.5">
        <StatusChip status={request.status} />
      </TableCell>
      {canApprove && (
        <TableCell className="px-3 py-2.5">
          {request.status === "pending" ? (
            <div className="flex justify-end gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="xs"
                disabled={busy}
                onClick={() => decide({ id: request.id, decision: "approved" })}
                aria-label={`Approve ${request.id} for ${request.employeeName}`}
                className="bg-success-soft text-success hover:bg-success/20 hover:text-success dark:hover:bg-success/20"
              >
                <Check aria-hidden />
                {deciding === "approved" ? "Approving…" : "Approve"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                disabled={busy}
                onClick={() => decide({ id: request.id, decision: "rejected" })}
                aria-label={`Reject ${request.id} for ${request.employeeName}`}
                className="text-danger hover:bg-danger-soft hover:text-danger dark:hover:bg-danger-soft"
              >
                <X aria-hidden />
                {deciding === "rejected" ? "Rejecting…" : "Reject"}
              </Button>
            </div>
          ) : (
            <span className="block text-right text-subtle-foreground">
              <span aria-hidden>—</span>
              <span className="sr-only">No action needed</span>
            </span>
          )}
        </TableCell>
      )}
    </TableRow>
  );
}

function SkeletonRows({ columns }: { columns: number }) {
  return Array.from({ length: 3 }, (_, i) => (
    <TableRow key={i} className="hover:bg-transparent">
      {Array.from({ length: columns }, (_, j) => (
        <TableCell key={j} className="px-3 py-3.5">
          <SkeletonBar className={j === 0 ? "w-24" : "w-14"} />
        </TableCell>
      ))}
    </TableRow>
  ));
}
