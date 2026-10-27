import { isAnyOf, type Middleware } from "@reduxjs/toolkit";
import { getRoute, hasPermission, roleMeta, PERMISSIONS } from "../model/permissions";
import { ATTENDANCE_WEEK, hrmsApi, LEAVE_LIST, LEAVE_WRITE_INVALIDATES, tagLabel, type ApiError } from "./api";
import { logged } from "./activity-slice";
import { actionBlocked, matrixReset, navigated, permissionToggled, roleChanged, type SessionState } from "./session-slice";

/**
 * Turns real store traffic into the "How this works" log. It observes the same
 * actions RTK Query dispatches internally, so the log can't drift from what the
 * cache actually did. It runs *before* `next(action)` so it can read the
 * previous state (was there data already? when did this request start?).
 */

type ObservedState = {
  session: SessionState;
  [hrmsApi.reducerPath]: ReturnType<typeof hrmsApi.reducer>;
};

const { getLeaveRequests, getTeamWeek, decideLeave, requestLeave } = hrmsApi.endpoints;

const queryTag: Record<string, string> = {
  getLeaveRequests: tagLabel(LEAVE_LIST),
  getTeamWeek: tagLabel(ATTENDANCE_WEEK),
};

const isQueryPending = isAnyOf(getLeaveRequests.matchPending, getTeamWeek.matchPending);
const isQueryFulfilled = isAnyOf(getLeaveRequests.matchFulfilled, getTeamWeek.matchFulfilled);
const isMutationPending = isAnyOf(decideLeave.matchPending, requestLeave.matchPending);
const isMutationFulfilled = isAnyOf(decideLeave.matchFulfilled, requestLeave.matchFulfilled);
const isApiRejected = isAnyOf(
  getLeaveRequests.matchRejected,
  getTeamWeek.matchRejected,
  decideLeave.matchRejected,
  requestLeave.matchRejected,
);

const invalidatedLabels = LEAVE_WRITE_INVALIDATES.map(tagLabel);

export const activityMiddleware: Middleware<object, ObservedState> = (store) => (next) => (action) => {
  const state = store.getState();
  const { role, matrix, route } = state.session;
  const cache = state[hrmsApi.reducerPath];
  const log = (entry: Parameters<typeof logged>[0]) => store.dispatch(logged(entry));

  if (roleChanged.match(action)) {
    const nextRole = action.payload;
    const { label } = roleMeta[nextRole];
    const count = matrix[nextRole].length;
    log({
      kind: "role",
      message: `role → ${label} (${count}/${PERMISSIONS.length} permissions)`,
      announce: `Viewing as ${label}. ${count} of ${PERMISSIONS.length} permissions.`,
    });
    const current = getRoute(route);
    if (!hasPermission(matrix, nextRole, current.requires)) {
      log({ kind: "denied", message: `guard: 403 ${current.path} · needs ${current.requires}` });
    }
  } else if (permissionToggled.match(action)) {
    const { role: target, permission } = action.payload;
    const granting = !hasPermission(matrix, target, permission);
    const verb = granting ? "granted" : "revoked";
    log({
      kind: "matrix",
      message: `matrix: ${roleMeta[target].label} ${granting ? "+" : "−"} ${permission}`,
      announce: `${permission} ${verb} for ${roleMeta[target].label}.`,
    });
  } else if (matrixReset.match(action)) {
    log({ kind: "matrix", message: "matrix: reset to defaults", announce: "Permissions reset to defaults." });
  } else if (navigated.match(action)) {
    const target = getRoute(action.payload);
    if (hasPermission(matrix, role, target.requires)) {
      log({ kind: "route", message: `navigate ${target.path}` });
    } else {
      log({
        kind: "denied",
        message: `guard: 403 ${target.path} · needs ${target.requires}`,
        announce: `Access denied to ${target.label}. Requires ${target.requires}.`,
      });
    }
  } else if (actionBlocked.match(action)) {
    const { action: name, permission } = action.payload;
    log({
      kind: "denied",
      message: `guard: blocked "${name}" · needs ${permission}`,
      announce: `${name} is locked. Requires ${permission}.`,
    });
  } else if (isQueryPending(action)) {
    const { queryCacheKey, endpointName } = action.meta.arg;
    const hasData = cache.queries[queryCacheKey]?.data !== undefined;
    log({ kind: hasData ? "refetch" : "fetch", message: `${hasData ? "refetch" : "fetch"} ${queryTag[endpointName]}` });
  } else if (isQueryFulfilled(action)) {
    const { queryCacheKey, endpointName } = action.meta.arg;
    const started = cache.queries[queryCacheKey]?.startedTimeStamp;
    const ms = started ? ` · ${action.meta.fulfilledTimeStamp - started}ms` : "";
    log({ kind: "resolved", message: `${queryTag[endpointName]} resolved${ms}` });
  } else if (isMutationPending(action)) {
    const { endpointName, originalArgs } = action.meta.arg;
    const detail =
      "decision" in originalArgs ? `${originalArgs.id} → ${originalArgs.decision}` : `${originalArgs.request.from}…`;
    log({ kind: "mutation", message: `mutation ${endpointName}(${detail})` });
  } else if (isMutationFulfilled(action)) {
    const { id, status } = action.payload;
    const verb = decideLeave.matchFulfilled(action) ? status : "submitted";
    log({
      kind: "invalidated",
      message: `invalidated: ${invalidatedLabels.join(", ")}`,
      announce: `${id} ${verb}. Invalidated ${invalidatedLabels.join(" and ")}; refetching.`,
    });
  } else if (isApiRejected(action) && !action.meta.condition) {
    // meta.condition = RTK Query skipped a duplicate request (already cached/in flight);
    // that's the cache working, not a failure, so it stays out of the log.
    const error = action.payload as ApiError | undefined;
    const message = error ? `${error.status} ${error.message}` : (action.error.message ?? "request failed");
    log({ kind: "error", message: `error ${message}`, announce: `Request failed: ${message}` });
  }

  return next(action);
};
