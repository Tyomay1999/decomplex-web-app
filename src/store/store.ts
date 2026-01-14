import { configureStore } from "@reduxjs/toolkit";

import authReducer from "@/features/auth/authSlice";
import notificationsReducer from "@/features/notifications/notificationsSlice";
import { api } from "@/services/api";
import { rtkQueryErrorToastMiddleware } from "@/store/rtkQueryErrorToastMiddleware";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
    notifications: notificationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: true,
      immutableCheck: true,
      serializableCheck: true,
    }).concat(api.middleware, rtkQueryErrorToastMiddleware),
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
