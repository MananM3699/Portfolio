"use client";

import { useId, useState } from "react";
import { Provider } from "react-redux";
import { DemoFrame } from "@/components/case-study/case-study";
import { AppShell } from "./app/app-shell";
import { PERMISSIONS } from "./model/permissions";
import { ArchitectureDiagram } from "./panel/architecture-diagram";
import { EventLog } from "./panel/event-log";
import { LiveAnnouncer } from "./panel/live-announcer";
import { PermissionCode } from "./panel/permission-code";
import { PermissionMatrix } from "./panel/permission-matrix";
import { RoleSwitcher } from "./panel/role-switcher";
import { makeStore, useAppSelector } from "./store/store";
import { useViewer } from "./guard";

/**
 * RBAC permission playground: a recreated mini HRMS for a fictional company.
 * One component tree, three roles, and an editable permission map; server state
 * flows through RTK Query so approvals visibly invalidate and refetch.
 */
export function RbacPlayground() {
  // Created once per mounted playground, never at module scope.
  const [store] = useState(makeStore);
  const headingId = useId();

  return (
    <Provider store={store}>
      <DemoFrame title="hrms · leave & attendance">
        <div className="@container">
          <Toolbar />
          <AppShell />
          <section aria-labelledby={headingId} className="border-t border-border bg-muted/40 p-4 sm:p-5">
            <h3 id={headingId} className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-brand">
              How this works
            </h3>
            <div className="mt-4 grid gap-6 @3xl:grid-cols-2">
              <div className="min-w-0 space-y-6">
                <PermissionMatrix />
                <PermissionCode />
              </div>
              <div className="min-w-0 space-y-6">
                <ArchitectureDiagram />
                <EventLog />
              </div>
            </div>
          </section>
        </div>
        <LiveAnnouncer />
      </DemoFrame>
    </Provider>
  );
}

function Toolbar() {
  const viewer = useViewer();
  const granted = useAppSelector((s) => s.session.matrix[s.session.role].length);
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-border px-3 py-2.5 sm:px-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-subtle-foreground" aria-hidden>
          View as
        </span>
        <RoleSwitcher />
      </div>
      <p className="font-mono text-[0.68rem] text-subtle-foreground">
        {viewer.persona} · {granted}/{PERMISSIONS.length} permissions
      </p>
      <p className="w-full text-xs text-muted-foreground">
        Try it: approve L-101 as Manager, then switch to Employee and open{" "}
        <code className="font-mono text-foreground">/reports</code> from the address bar.
      </p>
    </div>
  );
}
