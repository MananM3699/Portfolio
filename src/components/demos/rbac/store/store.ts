import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { createFakeDb } from "../model/fake-db";
import { activityMiddleware } from "./activity-middleware";
import { activitySlice } from "./activity-slice";
import { hrmsApi, type ApiExtra } from "./api";
import { sessionSlice } from "./session-slice";

const rootReducer = combineReducers({
  session: sessionSlice.reducer,
  activity: activitySlice.reducer,
  [hrmsApi.reducerPath]: hrmsApi.reducer,
});

/**
 * One store (and one fake database) per playground instance, created inside the
 * component. Nothing is module-level, so state never leaks between pages,
 * tests or two demos mounted at once.
 */
export function makeStore() {
  const extra: ApiExtra = { db: createFakeDb() };
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefault) =>
      getDefault({ thunk: { extraArgument: extra } })
        .prepend(activityMiddleware)
        .concat(hrmsApi.middleware),
  });
}

type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = AppStore["dispatch"];

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
