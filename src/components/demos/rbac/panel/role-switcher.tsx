"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ROLES, roleMeta, type Role } from "../model/permissions";
import { roleChanged } from "../store/session-slice";
import { useAppDispatch, useAppSelector } from "../store/store";

/**
 * Segmented control on shadcn's ToggleGroup. In single mode Radix renders a
 * radiogroup of radios with roving focus; selecting on focus keeps the native
 * radio behaviour where the arrow keys change the checked role.
 */
export function RoleSwitcher() {
  const dispatch = useAppDispatch();
  const role = useAppSelector((s) => s.session.role);

  const select = (next: Role) => {
    if (next !== role) dispatch(roleChanged(next));
  };

  return (
    <ToggleGroup
      type="single"
      value={role}
      // A single toggle group allows deselecting the active item; a role is always required.
      onValueChange={(value) => value && select(value as Role)}
      aria-label="View as role"
      size="sm"
      spacing={1}
      className="glass-subtle rounded-lg p-0.5"
    >
      {ROLES.map((r) => (
        <ToggleGroupItem
          key={r}
          value={r}
          onFocus={() => select(r)}
          className="h-7 rounded-md px-3 text-xs text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground data-[state=on]:bg-brand-soft data-[state=on]:text-brand data-[state=on]:ring-1 data-[state=on]:ring-brand/25"
        >
          {roleMeta[r].label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
