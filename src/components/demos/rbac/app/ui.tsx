import type { ReactNode } from "react";
import { RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LeaveStatus } from "../model/contracts";
import { statusTone } from "../model/format";

/**
 * Skins layered on shadcn's <Button> inside the mock app. `outline` keeps the
 * light theme translucent (shadcn's outline is an opaque background there);
 * `primary` is the brand fill with its soft glow.
 */
export const appButtonSkin = {
  outline: "bg-card shadow-xs hover:bg-secondary",
  primary:
    "bg-brand text-brand-foreground hover:bg-brand/90",
} as const;

const statusSkin: Record<(typeof statusTone)[LeaveStatus], string> = {
  warning: "bg-warning-soft text-warning",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
};

export function StatusChip({ status }: { status: LeaveStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn("border-transparent font-mono text-[0.68rem] font-medium", statusSkin[statusTone[status]])}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {status}
    </Badge>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/** Shown while a cached query refetches in the background (data stays on screen). */
export function RefetchBadge({ active, label }: { active: boolean; label: string }) {
  if (!active) return null;
  return (
    <span className="inline-flex items-center gap-1 font-mono text-[0.65rem] text-brand">
      <RefreshCw className="size-3 motion-safe:animate-spin" aria-hidden />
      refetch {label}
    </span>
  );
}

export function SkeletonBar({ className }: { className?: string }) {
  return <span className={cn("block h-3 rounded bg-foreground/10 motion-safe:animate-pulse", className)} aria-hidden />;
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-xs text-danger">
      {children}
    </p>
  );
}

/** Translucent frame for tables and grids inside the app pane (never a nested blur). */
export const paneClass = "border border-border bg-surface overflow-hidden rounded-md";

/** Header row of a data table: tinted, and no hover highlight. */
export const headRowClass = "bg-muted/60 hover:bg-muted/60";

/** Header cell density for the mock app's tables. */
export const headCellClass = "h-9 px-3 text-xs font-medium text-muted-foreground";
