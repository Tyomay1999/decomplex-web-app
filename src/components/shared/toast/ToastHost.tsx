"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { removeToast } from "@/features/notifications/notificationsSlice";
import { ToastViewport } from "./ToastViewport";
import { ToastCard } from "./ToastCard";

const AUTO_DISMISS_MS = 3500;

export function ToastHost() {
  const dispatch = useAppDispatch();
  const toasts = useAppSelector((s) => s.notifications.toasts);

  const timersRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    for (const t of toasts) {
      if (timersRef.current.has(t.id)) continue;

      const timerId = window.setTimeout(() => {
        timersRef.current.delete(t.id);
        dispatch(removeToast({ id: t.id }));
      }, AUTO_DISMISS_MS);

      timersRef.current.set(t.id, timerId);
    }

    const ids = new Set(toasts.map((t) => t.id));
    for (const [id, timerId] of timersRef.current.entries()) {
      if (!ids.has(id)) {
        window.clearTimeout(timerId);
        timersRef.current.delete(id);
      }
    }
  }, [toasts, dispatch]);

  useEffect(() => {
    return () => {
      for (const timerId of timersRef.current.values()) window.clearTimeout(timerId);
      timersRef.current.clear();
    };
  }, []);

  if (!toasts.length) return null;

  return (
    <ToastViewport>
      {toasts.map((t) => (
        <ToastCard key={t.id} message={t.message} kind={t.kind} />
      ))}
    </ToastViewport>
  );
}
