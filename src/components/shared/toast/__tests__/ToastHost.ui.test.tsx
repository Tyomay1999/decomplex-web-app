import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

import { ToastHost } from "../ToastHost";
import { removeToast } from "@/features/notifications/notificationsSlice";

type ToastKind = "error" | "success" | "info";

type ToastItem = {
  id: string;
  kind: ToastKind;
  message: string;
  count: number;
  createdAt: number;
  updatedAt: number;
};

type RootStateLike = {
  notifications: { toasts: ToastItem[] };
};

const mocked = vi.hoisted(() => {
  return {
    dispatch: vi.fn<(action: unknown) => void>(),
    toasts: [] as ToastItem[],
  };
});

vi.mock("@/store/hooks", () => {
  return {
    useAppDispatch: () => mocked.dispatch,
    useAppSelector: (selector: (s: RootStateLike) => unknown) =>
      selector({ notifications: { toasts: mocked.toasts } }),
  };
});

afterEach(() => {
  vi.useRealTimers();
  mocked.dispatch.mockReset();
  mocked.toasts = [];
});

describe("ToastHost", () => {
  it("auto-dismisses toast after timeout", async () => {
    vi.useFakeTimers();

    const now = Date.now();
    mocked.toasts = [
      {
        id: "t1",
        kind: "error",
        message: "Hello",
        count: 1,
        createdAt: now,
        updatedAt: now,
      },
    ];

    render(<ToastHost />);

    expect(mocked.dispatch).toHaveBeenCalledTimes(0);

    vi.advanceTimersByTime(3499);
    expect(mocked.dispatch).toHaveBeenCalledTimes(0);

    vi.advanceTimersByTime(1);

    expect(mocked.dispatch).toHaveBeenCalledTimes(1);
    expect(mocked.dispatch).toHaveBeenCalledWith(removeToast({ id: "t1" }));
  });

  it("does not dispatch removal if toast is removed before timeout", async () => {
    vi.useFakeTimers();

    const now = Date.now();
    mocked.toasts = [
      {
        id: "t1",
        kind: "info",
        message: "Soon gone",
        count: 1,
        createdAt: now,
        updatedAt: now,
      },
    ];

    const view = render(<ToastHost />);

    mocked.toasts = [];
    view.rerender(<ToastHost />);

    vi.advanceTimersByTime(4000);

    expect(mocked.dispatch).toHaveBeenCalledTimes(0);
  });

  it("cleans up timers on unmount", async () => {
    vi.useFakeTimers();

    const now = Date.now();
    mocked.toasts = [
      {
        id: "t1",
        kind: "success",
        message: "Unmount test",
        count: 1,
        createdAt: now,
        updatedAt: now,
      },
    ];

    const view = render(<ToastHost />);
    view.unmount();

    vi.advanceTimersByTime(4000);

    expect(mocked.dispatch).toHaveBeenCalledTimes(0);
  });
});
