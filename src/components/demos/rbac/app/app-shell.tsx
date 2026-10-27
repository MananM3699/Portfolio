"use client";

import { useId, type ComponentType } from "react";
import { BarChart3, CalendarDays, ChevronDown, Clock, Lock, Plane, Wallet, X, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/cn";
import { initials } from "../model/format";
import { getRoute, routes, type RouteId } from "../model/permissions";
import { Can, Forbidden, usePermission, useViewer } from "../guard";
import { blockedDismissed, navigated } from "../store/session-slice";
import { useAppDispatch, useAppSelector } from "../store/store";
import { AttendancePage } from "./attendance-page";
import { LeavePage } from "./leave-page";
import { PayrollPage } from "./payroll-page";
import { ReportsPage } from "./reports-page";
import { WeekCalendar } from "./week-calendar";
import { PageHeader } from "./ui";

const pages: Record<RouteId, { icon: LucideIcon; component: ComponentType }> = {
  leave: { icon: Plane, component: LeavePage },
  attendance: { icon: Clock, component: AttendancePage },
  calendar: { icon: CalendarDays, component: CalendarPage },
  payroll: { icon: Wallet, component: PayrollPage },
  reports: { icon: BarChart3, component: ReportsPage },
};

function CalendarPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Team calendar" description="Toggle layers to compare leave, holidays and shifts" />
      <WeekCalendar title="Week of 2 Nov" />
    </div>
  );
}

/** The mock HRMS app. Same tree for every role; only the permission map differs. */
export function AppShell() {
  const dispatch = useAppDispatch();
  const routeId = useAppSelector((s) => s.session.route);
  const route = getRoute(routeId);
  const allowed = usePermission(route.requires);
  const viewer = useViewer();
  const addressId = useId();
  const Page = pages[routeId].component;

  return (
    <div className="@container flex min-w-0 flex-col">
      {/* Fake browser address bar: lets readers deep-link past the hidden nav to hit the route guard. */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border px-3 py-2 sm:px-4">
        <span className="font-semibold tracking-tight text-foreground">
          HR<span className="text-brand">MS</span>
        </span>
        <div className="glass-subtle relative order-last flex h-8 min-w-0 flex-1 basis-full items-center rounded-lg pl-3 font-mono @md:order-none @md:basis-0 text-xs transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
          <label htmlFor={addressId} className="shrink-0 text-subtle-foreground">
            hrms.app
            <span className="sr-only"> address, try a deep link</span>
          </label>
          <select
            id={addressId}
            value={routeId}
            onChange={(e) => dispatch(navigated(e.target.value as RouteId))}
            className="h-full min-w-0 flex-1 cursor-pointer appearance-none bg-transparent pr-8 text-foreground outline-none"
          >
            {routes.map((r) => (
              <option key={r.id} value={r.id} className="bg-[Canvas] text-[CanvasText]">
                {r.path}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span
            aria-hidden
            className="flex size-7 items-center justify-center rounded-full bg-brand-soft font-mono text-[0.65rem] font-medium text-brand ring-1 ring-brand/25"
          >
            {initials(viewer.persona)}
          </span>
          <span className="text-xs leading-tight">
            <span className="block font-medium text-foreground">{viewer.persona}</span>
            <span className="block text-subtle-foreground">{viewer.label}</span>
          </span>
        </div>
      </div>

      <div className="grid min-w-0 @2xl:grid-cols-[10.5rem_minmax(0,1fr)]">
        <nav aria-label="HRMS" className="border-b border-border bg-muted/40 @2xl:border-r @2xl:border-b-0">
          <ul className="flex gap-1 overflow-x-auto p-2 @2xl:flex-col">
            {routes.map((r) => {
              const Icon = pages[r.id].icon;
              return (
                <Can key={r.id} permission={r.requires}>
                  <li className="shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => dispatch(navigated(r.id))}
                      aria-current={r.id === routeId ? "page" : undefined}
                      className={cn(
                        "w-full justify-start gap-2 rounded-lg px-2.5 text-xs transition-colors duration-150",
                        r.id === routeId
                          ? "bg-brand-soft text-brand ring-1 ring-brand/20 hover:bg-brand-soft hover:text-brand dark:hover:bg-brand-soft"
                          : "text-muted-foreground hover:bg-card hover:text-foreground dark:hover:bg-card",
                      )}
                    >
                      <Icon aria-hidden />
                      {r.label}
                    </Button>
                  </li>
                </Can>
              );
            })}
          </ul>
        </nav>

        <section aria-label={`${route.label} page`} className="@container min-h-104 min-w-0 p-4 sm:p-5">
          {allowed ? <Page /> : <Forbidden permission={route.requires} path={route.path} />}
        </section>
      </div>

      <BlockedNotice />
    </div>
  );
}

function BlockedNotice() {
  const dispatch = useAppDispatch();
  const blocked = useAppSelector((s) => s.session.blocked);
  const viewer = useViewer();
  if (!blocked) return null;
  return (
    <div className="flex items-start gap-2 border-t border-border bg-warning-soft px-3 py-2 text-xs text-muted-foreground sm:px-4">
      <Lock className="mt-0.5 size-3.5 shrink-0 text-warning" aria-hidden />
      <p className="flex-1">
        <span className="font-medium text-foreground">{blocked.action}</span> needs{" "}
        <code className="font-mono text-foreground">{blocked.permission}</code>. The {viewer.label} role doesn&apos;t
        have it; grant it in the matrix below to unlock.
      </p>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => dispatch(blockedDismissed())}
            aria-label="Dismiss"
            className="-my-0.5 text-muted-foreground"
          >
            <X aria-hidden />
          </Button>
        </TooltipTrigger>
        <TooltipContent sideOffset={6}>Dismiss</TooltipContent>
      </Tooltip>
    </div>
  );
}
