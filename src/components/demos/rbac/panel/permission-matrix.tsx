"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { appButtonSkin, headCellClass, headRowClass, paneClass } from "../app/ui";
import {
  defaultRolePermissions,
  hasPermission,
  PERMISSIONS,
  permissionMeta,
  ROLES,
  roleMeta,
} from "../model/permissions";
import { matrixReset, permissionToggled } from "../store/session-slice";
import { useAppDispatch, useAppSelector } from "../store/store";

/** Every cell is a shadcn (Radix) checkbox bound to the store; the app above re-renders from it. */
export function PermissionMatrix() {
  const dispatch = useAppDispatch();
  const { matrix, role: activeRole } = useAppSelector((s) => s.session);
  // Lists are kept in canonical order, so a join is an exact equality check.
  const changed = ROLES.some((r) => matrix[r].join() !== defaultRolePermissions[r].join());

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-medium text-foreground">Permission matrix</h4>
          <p className="text-xs text-muted-foreground">Toggle any cell and watch the app update.</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={() => dispatch(matrixReset())}
          disabled={!changed}
          className={appButtonSkin.outline}
        >
          <RotateCcw aria-hidden /> Reset
        </Button>
      </div>
      <div className={paneClass}>
        <Table className="min-w-[18rem] text-xs">
          <caption className="sr-only">Permissions granted to each role</caption>
          <TableHeader>
            <TableRow className={headRowClass}>
              <TableHead scope="col" className={headCellClass}>
                Permission
              </TableHead>
              {ROLES.map((r) => (
                <TableHead
                  key={r}
                  scope="col"
                  className={cn(
                    headCellClass,
                    "px-1.5 text-center transition-colors duration-200 sm:px-2",
                    r === activeRole && "bg-brand-soft text-brand",
                  )}
                >
                  {roleMeta[r].label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {PERMISSIONS.map((permission) => (
              <TableRow key={permission}>
                <TableHead scope="row" className="h-auto py-1.5 pr-1 pl-3 font-normal whitespace-normal">
                  <code className="font-mono text-[0.7rem] text-foreground">{permission}</code>
                  <span className="block text-[0.68rem] text-muted-foreground">{permissionMeta[permission]}</span>
                </TableHead>
                {ROLES.map((r) => {
                  const granted = hasPermission(matrix, r, permission);
                  const isDefault = granted === hasPermission(defaultRolePermissions, r, permission);
                  return (
                    <TableCell
                      key={r}
                      className={cn(
                        "px-1.5 py-1.5 text-center transition-colors duration-200 sm:px-2 [&:has([role=checkbox])]:pr-1.5 sm:[&:has([role=checkbox])]:pr-2",
                        r === activeRole && "bg-brand-soft",
                      )}
                    >
                      <span className="relative inline-flex align-middle">
                        <Checkbox
                          checked={granted}
                          onCheckedChange={() => dispatch(permissionToggled({ role: r, permission }))}
                          aria-label={`${roleMeta[r].label}: ${permission}`}
                          className="cursor-pointer bg-card data-checked:border-brand data-checked:bg-brand data-checked:text-brand-foreground dark:data-checked:bg-brand"
                        />
                        {!isDefault && (
                          <span
                            className="absolute -top-1 -right-1.5 size-1.5 rounded-full bg-warning ring-2 ring-background/60"
                            title="Changed from default"
                          >
                            <span className="sr-only">(changed from default)</span>
                          </span>
                        )}
                      </span>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="flex items-center gap-1.5 text-[0.68rem] text-muted-foreground">
        <span className="size-1.5 rounded-full bg-warning" aria-hidden /> changed from default
      </p>
    </div>
  );
}
