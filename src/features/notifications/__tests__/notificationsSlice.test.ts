import { describe, expect, it, vi } from "vitest";
import reducer, {
  clearToasts,
  pushToast,
  removeToast,
} from "@/features/notifications/notificationsSlice";

type ToastKind = "error" | "success" | "info";

describe("notificationsSlice", () => {
  it("pushToast adds a new toast", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

    const state1 = reducer(undefined, pushToast({ kind: "error", message: "A" }));
    expect(state1.toasts.length).toBe(1);
    expect(state1.toasts[0]?.kind).toBe("error");
    expect(state1.toasts[0]?.message).toBe("A");
    expect(state1.toasts[0]?.count).toBe(1);
    expect(typeof state1.toasts[0]?.id).toBe("string");

    vi.useRealTimers();
  });

  it("pushToast dedupes within window and increments count", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

    const base = reducer(undefined, pushToast({ kind: "error", message: "A" }));
    const t0 = base.toasts[0];
    expect(t0).toBeDefined();

    vi.setSystemTime(new Date("2026-01-01T00:00:01.000Z"));

    const next = reducer(base, pushToast({ kind: "error", message: "A" }));
    expect(next.toasts.length).toBe(1);
    expect(next.toasts[0]?.count).toBe(2);
    expect(next.toasts[0]?.id).toBe(t0?.id);

    vi.useRealTimers();
  });

  it("pushToast does not dedupe after window", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

    const s1 = reducer(undefined, pushToast({ kind: "error", message: "A" }));
    const firstId = s1.toasts[0]?.id;
    expect(firstId).toBeDefined();

    vi.setSystemTime(new Date("2026-01-01T00:00:03.000Z"));

    const s2 = reducer(s1, pushToast({ kind: "error", message: "A" }));
    expect(s2.toasts.length).toBe(2);
    expect(s2.toasts[0]?.id).toBe(firstId);
    expect(s2.toasts[1]?.id).not.toBe(firstId);

    vi.useRealTimers();
  });

  it("pushToast does not dedupe when kind differs", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

    const s1 = reducer(undefined, pushToast({ kind: "error", message: "A" }));
    const s2 = reducer(s1, pushToast({ kind: "success", message: "A" }));

    expect(s2.toasts.length).toBe(2);

    vi.useRealTimers();
  });

  it("removeToast removes by id", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

    const s1 = reducer(undefined, pushToast({ kind: "info", message: "X" }));
    const id = s1.toasts[0]?.id;
    expect(id).toBeDefined();

    const s2 = reducer(s1, removeToast({ id: String(id) }));
    expect(s2.toasts.length).toBe(0);

    vi.useRealTimers();
  });

  it("clearToasts clears all", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

    let s = reducer(undefined, pushToast({ kind: "info", message: "1" }));
    s = reducer(s, pushToast({ kind: "info", message: "2" }));
    expect(s.toasts.length).toBe(2);

    const cleared = reducer(s, clearToasts());
    expect(cleared.toasts.length).toBe(0);

    vi.useRealTimers();
  });

  it("pushToast accepts all supported kinds", () => {
    const kinds: ToastKind[] = ["error", "success", "info"];
    let s = reducer(undefined, { type: "init" });

    for (const kind of kinds) {
      s = reducer(s, pushToast({ kind, message: kind }));
    }

    expect(s.toasts.length).toBe(3);
    expect(s.toasts.map((t) => t.kind)).toEqual(kinds);
  });
});
