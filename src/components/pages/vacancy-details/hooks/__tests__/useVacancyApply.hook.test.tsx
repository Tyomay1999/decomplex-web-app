import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { MockedFunction } from "vitest";
import { renderHook } from "@testing-library/react";

import { useVacancyApply } from "../useVacancyApply";

type AuthUser = { userType?: string; role?: string } | null;

type AuthState = {
  accessToken: string | null;
  user: AuthUser;
};

type Router = {
  push: (url: string) => void;
};

type TFn = (key: string, values?: Record<string, unknown>) => string;

type RootState = { auth: AuthState };

const h = vi.hoisted(() => {
  const push: MockedFunction<(url: string) => void> = vi.fn();
  const router: Router = { push };

  const t: TFn = (key) => {
    if (key === "applyOnlyCandidate") return "Only candidates can apply";
    return key;
  };

  const auth: AuthState = { accessToken: null, user: null };

  const getAccessTokenFromCookie: MockedFunction<() => string | null> = vi.fn();

  const useAppSelector: MockedFunction<(selector: (s: RootState) => unknown) => unknown> = vi.fn(
    (selector: (s: RootState) => unknown) => selector({ auth }),
  );

  return { push, router, t, auth, getAccessTokenFromCookie, useAppSelector };
});

vi.mock("next/navigation", () => ({
  useRouter: () => h.router,
}));

vi.mock("next-intl", () => ({
  useTranslations: () => h.t,
}));

vi.mock("@/lib/authCookies", () => ({
  getAccessTokenFromCookie: () => h.getAccessTokenFromCookie(),
}));

vi.mock("@/store/hooks", () => ({
  useAppSelector: (selector: (s: RootState) => unknown) => h.useAppSelector(selector),
}));

describe("useVacancyApply", () => {
  beforeEach(() => {
    h.push.mockClear();
    h.auth.accessToken = null;
    h.auth.user = null;
    h.getAccessTokenFromCookie.mockImplementation(() => null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to login and returns false when not authenticated", () => {
    const { result } = renderHook(() => useVacancyApply({ vacancyId: "v1", locale: "en" }));

    const ok = result.current.openApply();

    expect(ok).toBe(false);
    expect(h.push).toHaveBeenCalledTimes(1);
    expect(h.push).toHaveBeenCalledWith("/en/login?redirect=%2Fen%2Fvacancies%2Fv1");
    expect(result.current.applyDisabled).toBe(false);
    expect(result.current.applyTitle).toBeUndefined();
  });

  it("returns true when authenticated candidate (userType)", () => {
    h.auth.accessToken = "token";
    h.auth.user = { userType: "candidate" };

    const { result } = renderHook(() => useVacancyApply({ vacancyId: "v1", locale: "hy" }));

    const ok = result.current.openApply();

    expect(ok).toBe(true);
    expect(h.push).not.toHaveBeenCalled();
    expect(result.current.applyDisabled).toBe(false);
    expect(result.current.applyTitle).toBeUndefined();
  });

  it("returns true when authenticated candidate (role)", () => {
    h.auth.accessToken = "token";
    h.auth.user = { role: "candidate" };

    const { result } = renderHook(() => useVacancyApply({ vacancyId: "v2", locale: "en" }));

    const ok = result.current.openApply();

    expect(ok).toBe(true);
    expect(h.push).not.toHaveBeenCalled();
    expect(result.current.applyDisabled).toBe(false);
    expect(result.current.applyTitle).toBeUndefined();
  });

  it("disables apply and returns false when authenticated but not a candidate", () => {
    h.auth.accessToken = "token";
    h.auth.user = { userType: "company" };

    const { result } = renderHook(() => useVacancyApply({ vacancyId: "v3", locale: "en" }));

    expect(result.current.applyDisabled).toBe(true);
    expect(result.current.applyTitle).toBe("Only candidates can apply");

    const ok = result.current.openApply();

    expect(ok).toBe(false);
    expect(h.push).not.toHaveBeenCalled();
  });

  it("treats cookie token as authenticated", () => {
    h.auth.accessToken = null;
    h.auth.user = { userType: "candidate" };
    h.getAccessTokenFromCookie.mockImplementation(() => "cookie-token");

    const { result } = renderHook(() => useVacancyApply({ vacancyId: "v4", locale: "en" }));

    const ok = result.current.openApply();

    expect(ok).toBe(true);
    expect(h.push).not.toHaveBeenCalled();
  });
});
