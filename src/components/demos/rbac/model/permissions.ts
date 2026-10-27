/**
 * The whole access model for the demo, declared as data.
 *
 * Components never ask "is this user a manager?". They ask "does this user hold
 * `leave:approve`?". Roles are only a named bundle of permissions, so a new role
 * (or a customer-specific tweak) is a change to this map, not to the UI.
 */

export const ROLES = ["employee", "manager", "hr_admin"] as const;
export type Role = (typeof ROLES)[number];

export const PERMISSIONS = [
  "leave:view",
  "leave:request",
  "leave:view-team",
  "leave:approve",
  "leave:export",
  "attendance:view",
  "calendar:view",
  "payroll:view",
  "salary:edit",
  "reports:view",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

export type RolePermissions = Record<Role, Permission[]>;

export const defaultRolePermissions: RolePermissions = {
  employee: ["leave:view", "leave:request", "attendance:view", "calendar:view"],
  manager: [
    "leave:view",
    "leave:request",
    "leave:view-team",
    "leave:approve",
    "attendance:view",
    "calendar:view",
  ],
  hr_admin: [...PERMISSIONS],
};

export const roleMeta: Record<Role, { label: string; persona: string; personaId: string }> = {
  employee: { label: "Employee", persona: "Asha Rao", personaId: "e-asha" },
  manager: { label: "Manager", persona: "Priya Nair", personaId: "e-priya" },
  hr_admin: { label: "HR Admin", persona: "Jonas Weber", personaId: "e-jonas" },
};

export const permissionMeta: Record<Permission, string> = {
  "leave:view": "Open the Leave module",
  "leave:request": "Submit a leave request",
  "leave:view-team": "See the team's requests, not only your own",
  "leave:approve": "Approve or reject requests",
  "leave:export": "Export leave as CSV",
  "attendance:view": "Open Attendance",
  "calendar:view": "Open the team calendar",
  "payroll:view": "Open Payroll",
  "salary:edit": "Edit an employee's salary",
  "reports:view": "Open Reports",
};

export type RouteId = "leave" | "attendance" | "calendar" | "payroll" | "reports";

/** Each route is guarded by exactly one permission; the nav is derived from this list. */
export const routes: { id: RouteId; path: string; label: string; requires: Permission }[] = [
  { id: "leave", path: "/leave", label: "Leave", requires: "leave:view" },
  { id: "attendance", path: "/attendance", label: "Attendance", requires: "attendance:view" },
  { id: "calendar", path: "/team-calendar", label: "Team calendar", requires: "calendar:view" },
  { id: "payroll", path: "/payroll", label: "Payroll", requires: "payroll:view" },
  { id: "reports", path: "/reports", label: "Reports", requires: "reports:view" },
];

export function getRoute(id: RouteId) {
  const route = routes.find((r) => r.id === id);
  if (!route) throw new Error(`Unknown route: ${id}`);
  return route;
}

export function hasPermission(map: RolePermissions, role: Role, permission: Permission) {
  return map[role].includes(permission);
}

/** Keeps every role's list in canonical PERMISSIONS order so diffs and snippets stay stable. */
export function togglePermission(list: Permission[], permission: Permission): Permission[] {
  const next = new Set(list);
  if (next.has(permission)) next.delete(permission);
  else next.add(permission);
  return PERMISSIONS.filter((p) => next.has(p));
}
