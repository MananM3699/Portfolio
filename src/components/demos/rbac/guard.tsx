"use client";

import type { ComponentProps, MouseEvent, ReactNode } from "react";
import { useId } from "react";
import { Lock, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { appButtonSkin } from "./app/ui";
import { hasPermission, roleMeta, type Permission } from "./model/permissions";
import { actionBlocked, navigated } from "./store/session-slice";
import { useAppDispatch, useAppSelector } from "./store/store";

/** The one question components are allowed to ask about access. */
export function usePermission(permission: Permission): boolean {
  return useAppSelector((s) => hasPermission(s.session.matrix, s.session.role, permission));
}

export function useViewer() {
  const role = useAppSelector((s) => s.session.role);
  return { role, ...roleMeta[role] };
}

/** Renders children only when the permission is held; otherwise the fallback (default: nothing). */
export function Can({
  permission,
  fallback = null,
  children,
}: {
  permission: Permission;
  fallback?: ReactNode;
  children: ReactNode;
}) {
  return usePermission(permission) ? children : fallback;
}

/**
 * For actions that should stay visible but locked, so users learn the feature
 * exists. Uses aria-disabled rather than `disabled` so it stays focusable and
 * the reason is reachable by keyboard and screen readers. A tooltip names the
 * missing permission on hover and focus; clicking still reports it to the
 * status bar.
 */
export function GuardedButton({
  permission,
  actionName,
  onClick,
  className,
  children,
  variant = "outline",
  size = "sm",
  ...props
}: ComponentProps<typeof Button> & { permission: Permission; actionName: string }) {
  const allowed = usePermission(permission);
  const dispatch = useAppDispatch();
  const reasonId = useId();

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (!allowed) {
      event.preventDefault();
      dispatch(actionBlocked({ action: actionName, permission }));
      return;
    }
    onClick?.(event);
  }

  // The Tooltip wrapper is always rendered so toggling the permission never
  // remounts the button (which would drop keyboard focus).
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant={variant}
          size={size}
          {...props}
          onClick={handleClick}
          aria-disabled={!allowed || undefined}
          aria-describedby={allowed ? props["aria-describedby"] : reasonId}
          className={cn(
            variant === "outline" && appButtonSkin.outline,
            className,
            !allowed && "cursor-not-allowed opacity-60",
          )}
        >
          {!allowed && <Lock aria-hidden />}
          {children}
          {!allowed && (
            <span id={reasonId} className="sr-only">
              Locked. Requires {permission}.
            </span>
          )}
        </Button>
      </TooltipTrigger>
      {!allowed && (
        <TooltipContent sideOffset={6}>
          Requires <code className="font-mono">{permission}</code>
        </TooltipContent>
      )}
    </Tooltip>
  );
}

/** Route-level fallback: explains what is missing instead of a blank screen. */
export function Forbidden({ permission, path }: { permission: Permission; path: string }) {
  const dispatch = useAppDispatch();
  const viewer = useViewer();
  const canLeave = usePermission("leave:view");
  return (
    <div className="flex min-h-64 flex-col items-center justify-center px-6 py-10 text-center">
      <span className="flex size-11 items-center justify-center rounded-full bg-danger-soft text-danger ring-1 ring-danger/20">
        <ShieldX className="size-5" aria-hidden />
      </span>
      <p className="mt-4 font-mono text-xs text-subtle-foreground">403 · {path}</p>
      <h3 className="mt-1 text-base font-semibold text-foreground">You need {permission}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        The {viewer.label} role doesn&apos;t include this permission. Hiding the nav item isn&apos;t
        enough on its own, so the route checks again before rendering anything.
      </p>
      {canLeave && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => dispatch(navigated("leave"))}
          className={cn("mt-5", appButtonSkin.outline)}
        >
          Back to Leave
        </Button>
      )}
    </div>
  );
}
