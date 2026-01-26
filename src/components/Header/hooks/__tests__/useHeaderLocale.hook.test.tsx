import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";

import { useHeaderLocale } from "../useHeaderLocale";

type Params = { locale?: string };

const mocked = vi.hoisted(() => {
  return {
    useParams: vi.fn<() => Params>(),
  };
});

vi.mock("next/navigation", () => {
  return {
    useParams: mocked.useParams,
  };
});

describe("useHeaderLocale", () => {
  it("returns locale when it is supported", () => {
    mocked.useParams.mockReturnValue({ locale: "ru" });

    const { result } = renderHook(() => useHeaderLocale());

    expect(result.current).toBe("ru");
  });

  it("defaults to en when locale is missing", () => {
    mocked.useParams.mockReturnValue({});

    const { result } = renderHook(() => useHeaderLocale());

    expect(result.current).toBe("en");
  });

  it("defaults to en when locale is not supported", () => {
    mocked.useParams.mockReturnValue({ locale: "de" });

    const { result } = renderHook(() => useHeaderLocale());

    expect(result.current).toBe("en");
  });
});
