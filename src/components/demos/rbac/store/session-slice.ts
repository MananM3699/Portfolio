import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  defaultRolePermissions,
  togglePermission,
  type Permission,
  type Role,
  type RolePermissions,
  type RouteId,
} from "../model/permissions";

/** Client-only state: who is "signed in", what the matrix grants, and where they are. */
export type SessionState = {
  role: Role;
  matrix: RolePermissions;
  route: RouteId;
  /** Last action the guard refused, shown in the app's status bar. */
  blocked: { action: string; permission: Permission } | null;
};

const initialState: SessionState = {
  role: "manager",
  matrix: defaultRolePermissions,
  route: "leave",
  blocked: null,
};

export const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    roleChanged(state, action: PayloadAction<Role>) {
      state.role = action.payload;
      state.blocked = null;
    },
    permissionToggled(state, action: PayloadAction<{ role: Role; permission: Permission }>) {
      const { role, permission } = action.payload;
      state.matrix[role] = togglePermission(state.matrix[role], permission);
      state.blocked = null;
    },
    matrixReset(state) {
      state.matrix = defaultRolePermissions;
      state.blocked = null;
    },
    navigated(state, action: PayloadAction<RouteId>) {
      state.route = action.payload;
      state.blocked = null;
    },
    actionBlocked(state, action: PayloadAction<{ action: string; permission: Permission }>) {
      state.blocked = action.payload;
    },
    blockedDismissed(state) {
      state.blocked = null;
    },
  },
});

export const { roleChanged, permissionToggled, matrixReset, navigated, actionBlocked, blockedDismissed } =
  sessionSlice.actions;
