import { afterEach, describe, expect, it, vi } from "vitest";
import type { MockedFunction } from "vitest";
import { http, HttpResponse } from "msw";

import { server } from "../../../../test/msw/server";

type ApiSuccessResponse<T> = { success: boolean; data: T };

type Locale = "en" | "hy" | "ru";

type UserDto = {
  id: string;
  email: string;
  role: string;
  language?: Locale | null;
  firstName?: string | null;
  lastName?: string | null;
  userType?: "candidate" | "company" | null;
};

type LoginResponseData = {
  accessToken: string;
  refreshToken: string;
  fingerprintHash: string;
  userType: "candidate" | "company";
  user: UserDto;
  company?: unknown;
};

type LoginRequest = {
  email: string;
  password: string;
  rememberUser?: boolean;
  language?: Locale;
  companyId?: string;
  fingerprint?: string;
};

type LogoutResponse = { success: boolean };

type OnLoginSuccess = (dispatch: unknown, data: LoginResponseData) => void;
type OnLogoutFinally = (dispatch: unknown) => void;
type NoopHandler = (...args: unknown[]) => void;

type MockedHandlers = {
  onLoginSuccess: MockedFunction<OnLoginSuccess>;
  onLogoutFinally: MockedFunction<OnLogoutFinally>;
  onRegisterCandidateSuccess: MockedFunction<NoopHandler>;
  onRegisterCompanySuccess: MockedFunction<NoopHandler>;
  onCurrentOrMeSuccess: MockedFunction<NoopHandler>;
};

import type { authApi as AuthApi } from "../authApi";
import type { createTestStore as createTestStoreFn } from "../../../../test/shared/store/createTestStore";

async function loadAuthApi(mocks: { refreshToken: string | null }): Promise<{
  authApi: typeof AuthApi;
  mocked: MockedHandlers;
  createTestStore: typeof createTestStoreFn;
}> {
  vi.resetModules();

  const mocked: MockedHandlers = {
    onLoginSuccess: vi.fn<OnLoginSuccess>(),
    onLogoutFinally: vi.fn<OnLogoutFinally>(),
    onRegisterCandidateSuccess: vi.fn<NoopHandler>(),
    onRegisterCompanySuccess: vi.fn<NoopHandler>(),
    onCurrentOrMeSuccess: vi.fn<NoopHandler>(),
  };

  vi.doMock("../authHandlers", () => ({
    onLoginSuccess: mocked.onLoginSuccess,
    onLogoutFinally: mocked.onLogoutFinally,
    onRegisterCandidateSuccess: mocked.onRegisterCandidateSuccess,
    onRegisterCompanySuccess: mocked.onRegisterCompanySuccess,
    onCurrentOrMeSuccess: mocked.onCurrentOrMeSuccess,
  }));

  vi.doMock("@/lib/authCookies", () => ({
    getRefreshTokenFromCookie: () => mocks.refreshToken,
    setAuthCookies: vi.fn(),
    clearAuthCookies: vi.fn(),
    getAccessTokenFromCookie: () => null,
  }));

  const { createTestStore } = await import("../../../../test/shared/store/createTestStore");
  const mod = await import("../authApi");

  return { authApi: mod.authApi, mocked, createTestStore };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("authApi integration", () => {
  it("login triggers onLoginSuccess with fulfilled data", async () => {
    const { authApi, mocked, createTestStore } = await loadAuthApi({ refreshToken: null });
    const store = createTestStore();

    const loginData: LoginResponseData = {
      accessToken: "at",
      refreshToken: "rt",
      fingerprintHash: "fp",
      userType: "candidate",
      user: { id: "u1", email: "a@b.com", role: "user", language: "en" },
    };

    server.use(
      http.post("http://localhost:9999/auth/login", async () => {
        const payload: ApiSuccessResponse<LoginResponseData> = { success: true, data: loginData };
        return HttpResponse.json(payload, { status: 200 });
      }),
    );

    const req: LoginRequest = { email: "a@b.com", password: "pw" };

    await store.dispatch(authApi.endpoints.login.initiate(req)).unwrap();

    expect(mocked.onLoginSuccess).toHaveBeenCalledTimes(1);

    const call = mocked.onLoginSuccess.mock.calls[0] as unknown as [unknown, LoginResponseData];

    expect(typeof call[0]).toBe("function");
    expect(call[1]).toEqual(loginData);
  });

  it("logout always calls onLogoutFinally and includes refreshToken in body when present", async () => {
    const refreshToken = "rt_cookie";
    const { authApi, mocked, createTestStore } = await loadAuthApi({ refreshToken });
    const store = createTestStore();

    server.use(
      http.patch("http://localhost:9999/auth/logout", async ({ request }) => {
        const body = (await request.json()) as unknown;
        const rec = body as Record<string, unknown>;
        expect(rec.refreshToken).toBe(refreshToken);

        const payload: ApiSuccessResponse<LogoutResponse> = {
          success: true,
          data: { success: true },
        };
        return HttpResponse.json(payload, { status: 200 });
      }),
    );

    await store.dispatch(authApi.endpoints.logout.initiate()).unwrap();

    expect(mocked.onLogoutFinally).toHaveBeenCalledTimes(1);

    const call = mocked.onLogoutFinally.mock.calls[0] as unknown as [unknown];

    expect(typeof call[0]).toBe("function");
  });

  it("logout calls onLogoutFinally even when request fails", async () => {
    const { authApi, mocked, createTestStore } = await loadAuthApi({ refreshToken: "rt_cookie" });
    const store = createTestStore();

    server.use(
      http.patch("http://localhost:9999/auth/logout", async () => {
        return HttpResponse.json({ success: false, data: null }, { status: 500 });
      }),
    );

    const p = store.dispatch(authApi.endpoints.logout.initiate()).unwrap();

    await expect(p).rejects.toBeDefined();

    expect(mocked.onLogoutFinally).toHaveBeenCalledTimes(1);

    const call = mocked.onLogoutFinally.mock.calls[0] as unknown as [unknown];

    expect(typeof call[0]).toBe("function");
  });
});
