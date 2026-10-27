import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";

export type ActivityKind =
  | "role"
  | "matrix"
  | "route"
  | "denied"
  | "fetch"
  | "refetch"
  | "resolved"
  | "mutation"
  | "invalidated"
  | "error";

export type ActivityEntry = {
  id: string;
  at: number;
  kind: ActivityKind;
  message: string;
  /** Sentence for the screen-reader live region; null for routine entries. */
  announce: string | null;
};

const MAX_ENTRIES = 40;

export const activitySlice = createSlice({
  name: "activity",
  initialState: { entries: [] as ActivityEntry[] },
  reducers: {
    logged: {
      reducer(state, action: PayloadAction<ActivityEntry>) {
        state.entries.push(action.payload);
        if (state.entries.length > MAX_ENTRIES) state.entries.splice(0, state.entries.length - MAX_ENTRIES);
      },
      // Impure values (id, clock) belong in prepare, never in the reducer.
      prepare(entry: { kind: ActivityKind; message: string; announce?: string }) {
        return { payload: { id: nanoid(), at: Date.now(), ...entry, announce: entry.announce ?? null } };
      },
    },
    cleared(state) {
      state.entries = [];
    },
  },
});

export const { logged, cleared } = activitySlice.actions;
