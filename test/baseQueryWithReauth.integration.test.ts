import { describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import type { BaseQueryApi, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { RootState } from "@/store/store";

import { server } from "./msw/server";
import { createTestStore } from "./shared/store";
import {
  authCookiesMock,
  fingerprintMock,
  resetAuthCookiesMock,
  resetFingerprintMock,
} from "./shared/mocks";

type RefreshData = {
  accessToken: string;
  refreshToken: string;
  fingerprintHash?: string | null;
  user?: unknown;
};

type ApiSuccessResponse<T> = {
  success: boolean;
  data: T;
};

const makeBaseQueryApi = (store: {
  dispatch: (a: unknown) => void;
  getState: () => unknown;
}): BaseQueryApi => {
  const controller = new AbortController();

  return {
    dispatch: store.dispatch,
    getState: store.getState,
    extra: undefined,
    endpoint: "test",
    type: "query",
    forced: false,
    queryCacheKey: "test",
    signal: controller.signal,
    abort: (_reason?: string) => controller.abort(),
  };
};

const installModuleMocks = (): void => {
  vi.doMock("@/lib/authCookies", () => ({
    clearAuthCookies: authCookiesMock.clearAuthCookies,
    getAccessTokenFromCookie: authCookiesMock.getAccessTokenFromCookie,
    getRefreshTokenFromCookie: authCookiesMock.getRefreshTokenFromCookie,
    setAuthCookies: authCookiesMock.setAuthCookies,
  }));

  vi.doMock("@/lib/fingerprint", () => ({
    getOrCreateFingerprint: fingerprintMock.getOrCreateFingerprint,
  }));
};

describe("baseQueryWithReauth", () => {
  it("retries request after successful refresh", async () => {
    resetAuthCookiesMock();
    resetFingerprintMock();

    vi.resetModules();
    installModuleMocks();

    server.use(
      http.get("http://localhost:9999/protected", ({ request }) => {
        const auth = request.headers.get("authorization");
        if (!auth) return new HttpResponse(null, { status: 401 });
        if (auth === "Bearer new_access") return HttpResponse.json({ ok: true });
        return new HttpResponse(null, { status: 401 });
      }),
      http.post("http://localhost:9999/auth/refresh", async ({ request }) => {
        const body = (await request.json()) as { refreshToken?: unknown };
        const rt = typeof body.refreshToken === "string" ? body.refreshToken : "";
        if (rt !== "rt_1") return new HttpResponse(null, { status: 401 });

        const payload: ApiSuccessResponse<RefreshData> = {
          success: true,
          data: {
            accessToken: "new_access",
            refreshToken: "new_refresh",
            fingerprintHash: null,
          },
        };

        return HttpResponse.json(payload);
      }),
    );

    const preloadedState = {
      auth: {
        status: "anonymous",
        accessToken: null,
        refreshToken: "rt_1",
        fingerprintHash: null,
        user: null,
      },
      notifications: { toasts: [] },
    } satisfies Partial<RootState>;

    const store = createTestStore(preloadedState);

    const mod = await import("@/services/api");
    const baseQueryWithReauth = mod.baseQueryWithReauth;

    const api = makeBaseQueryApi(store);
    const args: FetchArgs = { url: "/protected", method: "GET" };

    const result = await baseQueryWithReauth(args, api, {});

    expect((result as { error?: FetchBaseQueryError }).error).toBeUndefined();
    expect((result as { data?: unknown }).data).toEqual({ ok: true });

    expect(authCookiesMock.setAuthCookies).toHaveBeenCalledTimes(1);
    expect(authCookiesMock.setAuthCookies).toHaveBeenCalledWith("new_access", "new_refresh");
    expect(authCookiesMock.clearAuthCookies).not.toHaveBeenCalled();

    const state = store.getState() as {
      auth: { accessToken: string | null; refreshToken: string | null };
    };

    expect(state.auth.accessToken).toBe("new_access");
    expect(state.auth.refreshToken).toBe("new_refresh");
  });

  it("clears session when refresh token is missing", async () => {
    resetAuthCookiesMock();
    resetFingerprintMock();

    vi.resetModules();
    installModuleMocks();

    server.use(
      http.get("http://localhost:9999/protected", () => new HttpResponse(null, { status: 401 })),
    );

    const preloadedState = {
      auth: {
        status: "anonymous",
        accessToken: null,
        refreshToken: null,
        fingerprintHash: null,
        user: null,
      },
      notifications: { toasts: [] },
    } satisfies Partial<RootState>;

    const store = createTestStore(preloadedState);

    const mod = await import("@/services/api");
    const baseQueryWithReauth = mod.baseQueryWithReauth;

    const api = makeBaseQueryApi(store);
    const args: FetchArgs = { url: "/protected", method: "GET" };

    const result = await baseQueryWithReauth(args, api, {});

    expect((result as { error?: FetchBaseQueryError }).error?.status).toBe(401);
    expect(authCookiesMock.setAuthCookies).not.toHaveBeenCalled();
    expect(authCookiesMock.clearAuthCookies).toHaveBeenCalledTimes(1);

    const state = store.getState() as { auth: { status: string } };
    expect(state.auth.status).toBe("anonymous");
  });
});
