import { combineReducers, configureStore } from "@reduxjs/toolkit";

import authReducer from "@/features/auth/authSlice";
import notificationsReducer from "@/features/notifications/notificationsSlice";
import { api } from "@/services/api";
import { rtkQueryErrorToastMiddleware } from "@/store/rtkQueryErrorToastMiddleware";

type DeepPartial<T> = T extends (infer U)[]
  ? DeepPartial<U>[]
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  auth: authReducer,
  notifications: notificationsReducer,
});

export type TestRootState = ReturnType<typeof rootReducer>;

export const createTestStore = (preloadedState?: DeepPartial<TestRootState>) => {
  return configureStore({
    reducer: rootReducer,
    preloadedState: preloadedState as TestRootState | undefined,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: true,
        immutableCheck: true,
        serializableCheck: true,
      }).concat(api.middleware, rtkQueryErrorToastMiddleware),
    devTools: false,
  });
};

export type TestStore = ReturnType<typeof createTestStore>;
