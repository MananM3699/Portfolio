import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import type { CreateLeaveRequest, LeaveDecision, LeaveRequest, TeamWeek } from "../model/contracts";
import { FakeDbError, type FakeDb } from "../model/fake-db";

/** Injected per store through `thunk.extraArgument`, so every playground gets its own data. */
export type ApiExtra = { db: FakeDb };

export type ApiError = { status: number; message: string };

export const LEAVE_LIST = { type: "Leave", id: "LIST" } as const;
export const ATTENDANCE_WEEK = { type: "Attendance", id: "WEEK" } as const;

/**
 * Any write to leave also changes the attendance week (a leave day replaces a
 * shift), so both caches are invalidated together. Exported so the activity
 * log reports exactly what the endpoints declare.
 */
export const LEAVE_WRITE_INVALIDATES = [LEAVE_LIST, ATTENDANCE_WEEK];

export const tagLabel = (tag: { type: string; id: string }) => `${tag.type}:${tag.id}`;

async function run<T>(extra: unknown, call: (db: FakeDb) => Promise<T>) {
  const { db } = extra as ApiExtra;
  try {
    return { data: await call(db) };
  } catch (error) {
    const apiError: ApiError =
      error instanceof FakeDbError
        ? { status: error.status, message: error.message }
        : { status: 500, message: "Contract violation: response failed schema validation" };
    return { error: apiError };
  }
}

export const hrmsApi = createApi({
  reducerPath: "hrmsApi",
  baseQuery: fakeBaseQuery<ApiError>(),
  tagTypes: ["Leave", "Attendance"],
  endpoints: (build) => ({
    getLeaveRequests: build.query<LeaveRequest[], { viewerId: string; scope: "own" | "team" }>({
      queryFn: (params, { extra }) => run(extra, (db) => db.listLeave(params)),
      // One list-level tag: a status change can move rows between filters, so the list refetches as a whole.
      providesTags: [LEAVE_LIST],
    }),
    getTeamWeek: build.query<TeamWeek, void>({
      queryFn: (_arg, { extra }) => run(extra, (db) => db.teamWeek()),
      providesTags: [ATTENDANCE_WEEK],
    }),
    decideLeave: build.mutation<LeaveRequest, LeaveDecision>({
      queryFn: (decision, { extra }) => run(extra, (db) => db.decideLeave(decision)),
      invalidatesTags: (_result, error) => (error ? [] : LEAVE_WRITE_INVALIDATES),
    }),
    requestLeave: build.mutation<LeaveRequest, CreateLeaveRequest>({
      queryFn: (input, { extra }) => run(extra, (db) => db.createLeave(input)),
      invalidatesTags: (_result, error) => (error ? [] : LEAVE_WRITE_INVALIDATES),
    }),
  }),
});

export const {
  useGetLeaveRequestsQuery,
  useGetTeamWeekQuery,
  useDecideLeaveMutation,
  useRequestLeaveMutation,
} = hrmsApi;
