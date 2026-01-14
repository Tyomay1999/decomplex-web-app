import type { Middleware } from "@reduxjs/toolkit";
import { isRejectedWithValue } from "@reduxjs/toolkit";
import { pushToast } from "@/features/notifications/notificationsSlice";

type ErrorPayload = {
  status?: number | string;
  data?: unknown;
  error?: string;
};

function pickBackendMessage(payload: unknown): string | null {
  const p = payload as ErrorPayload | undefined;
  if (!p) return null;

  if (typeof p.error === "string" && p.error.trim()) return p.error.trim();

  const data = p.data;
  if (!data || typeof data !== "object") return null;

  const obj = data as Record<string, unknown>;

  if (typeof obj.message === "string" && obj.message.trim()) return obj.message.trim();

  if (obj.error && typeof obj.error === "object") {
    const e1 = obj.error as Record<string, unknown>;
    if (typeof e1.message === "string" && e1.message.trim()) return e1.message.trim();

    if (e1.error && typeof e1.error === "object") {
      const e2 = e1.error as Record<string, unknown>;
      if (typeof e2.message === "string" && e2.message.trim()) return e2.message.trim();
    }
  }

  if (typeof obj.detail === "string" && obj.detail.trim()) return obj.detail.trim();
  if (typeof obj.title === "string" && obj.title.trim()) return obj.title.trim();

  return null;
}

function fallbackFrontendMessage(payload: unknown): string {
  const p = payload as ErrorPayload | undefined;

  if (p && typeof p.error === "string") {
    const e = p.error.toLowerCase();
    if (e.includes("failed to fetch") || e.includes("network")) {
      return "Ошибка сети. Проверьте подключение к интернету и попробуйте ещё раз.";
    }
    if (e.includes("timeout")) {
      return "Превышено время ожидания. Попробуйте ещё раз.";
    }
  }

  return "Произошла ошибка. Попробуйте ещё раз.";
}

export const rtkQueryErrorToastMiddleware: Middleware = () => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const backendMsg = pickBackendMessage(action.payload);
    const message = backendMsg ?? fallbackFrontendMessage(action.payload);

    next(pushToast({ kind: "error", message }));
  }

  return next(action);
};
