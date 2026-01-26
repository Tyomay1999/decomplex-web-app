import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { useDebouncedValue } from "../useDebouncedValue";

describe("useDebouncedValue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("returns initial value immediately", () => {
    const { result } = renderHook(({ value }) => useDebouncedValue(value, 400), {
      initialProps: { value: "a" },
    });

    expect(result.current).toBe("a");
  });

  it("does not update value before delay elapses", () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 400), {
      initialProps: { value: "a" },
    });

    act(() => {
      rerender({ value: "b" });
    });

    act(() => {
      vi.advanceTimersByTime(399);
    });

    expect(result.current).toBe("a");
  });

  it("updates value after delay elapses", () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 400), {
      initialProps: { value: "a" },
    });

    act(() => {
      rerender({ value: "b" });
    });

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(result.current).toBe("b");
  });

  it("applies only the last value for rapid changes", () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 400), {
      initialProps: { value: "a" },
    });

    act(() => {
      rerender({ value: "b" });
      rerender({ value: "c" });
      rerender({ value: "d" });
    });

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(result.current).toBe("d");
  });

  it("reacts to delay changes correctly", () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebouncedValue(value, delay), {
      initialProps: { value: "a", delay: 500 },
    });

    act(() => {
      rerender({ value: "b", delay: 200 });
    });

    act(() => {
      vi.advanceTimersByTime(199);
    });

    expect(result.current).toBe("a");

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current).toBe("b");
  });
});
