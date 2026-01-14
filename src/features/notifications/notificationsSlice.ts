import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type ToastKind = "error" | "success" | "info";

export type ToastItem = {
  id: string;
  kind: ToastKind;
  message: string;
  count: number;
  createdAt: number;
  updatedAt: number;
};

type NotificationsState = {
  toasts: ToastItem[];
};

const initialState: NotificationsState = {
  toasts: [],
};

function uid(): string {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

const DEDUPE_WINDOW_MS = 2000;

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    pushToast(
      state,
      action: PayloadAction<Omit<ToastItem, "id" | "count" | "createdAt" | "updatedAt">>,
    ) {
      const now = Date.now();
      const { kind, message } = action.payload;

      const existing = [...state.toasts]
        .reverse()
        .find((t) => t.kind === kind && t.message === message);

      if (existing && now - existing.updatedAt <= DEDUPE_WINDOW_MS) {
        existing.count += 1;
        existing.updatedAt = now;
        return;
      }

      state.toasts.push({
        id: uid(),
        kind,
        message,
        count: 1,
        createdAt: now,
        updatedAt: now,
      });
    },

    removeToast(state, action: PayloadAction<{ id: string }>) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload.id);
    },

    clearToasts(state) {
      state.toasts = [];
    },
  },
});

export const { pushToast, removeToast, clearToasts } = notificationsSlice.actions;
export default notificationsSlice.reducer;
