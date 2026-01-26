import { describe, expect, it, vi } from "vitest";
import type { AppDispatch } from "@/store/store";
import type { RootState } from "@/store/store";
import type { UserDto } from "@/features/auth/types";

type AuthCookiesModule = {
  clearAuthCookies: () => void;
  setAuthCookies: (accessToken: string, refreshToken: string) => void;
};

type FingerprintModule = {
  getOrCreateFingerprint: (serverFingerprint?: string) => string;
};

const mocked = vi.hoisted(() => {
  return {
    setAuthCookies: vi.fn<AuthCookiesModule["setAuthCookies"]>(),
    clearAuthCookies: vi.fn<AuthCookiesModule["clearAuthCookies"]>(),
    getOrCreateFingerprint: vi.fn<FingerprintModule["getOrCreateFingerprint"]>(),
  };
});

vi.mock("@/lib/authCookies", (): AuthCookiesModule => {
  return {
    clearAuthCookies: mocked.clearAuthCookies,
    setAuthCookies: mocked.setAuthCookies,
  };
});

vi.mock("@/lib/fingerprint", (): FingerprintModule => {
  return {
    getOrCreateFingerprint: mocked.getOrCreateFingerprint,
  };
});

import {
  onCurrentOrMeSuccess,
  onLogoutFinally,
  persistAuthSession,
} from "@/features/auth/authHandlers";

type DispatchFn = AppDispatch;

function makeUser(overrides: Partial<UserDto> = {}): UserDto {
  return {
    id: "u_1",
    email: "u1@test.com",
    role: "candidate",
    ...overrides,
  };
}

function makeRootState(
  overrides: {
    auth?: Partial<RootState["auth"]>;
    notifications?: Partial<RootState["notifications"]>;
    api?: RootState["api"];
  } = {},
): RootState {
  return {
    api: overrides.api ?? ({} as RootState["api"]),
    auth: {
      status: "anonymous",
      accessToken: null,
      refreshToken: null,
      fingerprintHash: "fp_state",
      user: null,
      ...(overrides.auth ?? {}),
    },
    notifications: {
      toasts: [],
      ...(overrides.notifications ?? {}),
    },
  };
}

describe("authHandlers", () => {
  it("persistAuthSession stores cookies, optionally seeds fingerprint, and dispatches setSession", () => {
    mocked.setAuthCookies.mockClear();
    mocked.clearAuthCookies.mockClear();
    mocked.getOrCreateFingerprint.mockClear();

    const actions: unknown[] = [];
    const dispatch: DispatchFn = ((a: unknown) => {
      actions.push(a);
      return a;
    }) as unknown as DispatchFn;

    persistAuthSession(dispatch, {
      accessToken: "at_1",
      refreshToken: "rt_1",
      fingerprintHash: "fp_1",
      user: makeUser(),
    });

    expect(mocked.getOrCreateFingerprint).toHaveBeenCalledTimes(1);
    expect(mocked.getOrCreateFingerprint).toHaveBeenCalledWith("fp_1");

    expect(mocked.setAuthCookies).toHaveBeenCalledTimes(1);
    expect(mocked.setAuthCookies).toHaveBeenCalledWith("at_1", "rt_1");

    const setSessionAction = actions.find((a) => {
      const r = a as { type?: unknown };
      return r && typeof r.type === "string" && r.type.endsWith("/setSession");
    });

    expect(setSessionAction).toBeTruthy();
  });

  it("persistAuthSession does not call getOrCreateFingerprint when fingerprint is null", () => {
    mocked.setAuthCookies.mockClear();
    mocked.getOrCreateFingerprint.mockClear();

    const actions: unknown[] = [];
    const dispatch: DispatchFn = ((a: unknown) => {
      actions.push(a);
      return a;
    }) as unknown as DispatchFn;

    persistAuthSession(dispatch, {
      accessToken: "at_2",
      refreshToken: "rt_2",
      fingerprintHash: null,
      user: makeUser(),
    });

    expect(mocked.getOrCreateFingerprint).not.toHaveBeenCalled();
    expect(mocked.setAuthCookies).toHaveBeenCalledTimes(1);

    const setSessionAction = actions.find((a) => {
      const r = a as { type?: unknown };
      return r && typeof r.type === "string" && r.type.endsWith("/setSession");
    });

    expect(setSessionAction).toBeTruthy();
  });

  it("onCurrentOrMeSuccess patches user and keeps fingerprintHash from state", () => {
    const actions: unknown[] = [];
    const dispatch: DispatchFn = ((a: unknown) => {
      actions.push(a);
      return a;
    }) as unknown as DispatchFn;

    const getState = () => makeRootState({ auth: { fingerprintHash: "fp_keep" } });

    onCurrentOrMeSuccess(dispatch, getState, { user: makeUser({ id: "u_9" }) });

    const patchAction = actions.find((a) => {
      const r = a as { type?: unknown };
      return r && typeof r.type === "string" && r.type.endsWith("/patchSession");
    });

    expect(patchAction).toBeTruthy();

    const payload = (patchAction as { payload?: unknown } | undefined)?.payload as
      | { user?: unknown; fingerprintHash?: unknown }
      | undefined;

    expect(payload?.fingerprintHash).toBe("fp_keep");

    const u = payload?.user as UserDto | undefined;
    expect(u?.id).toBe("u_9");
  });

  it("onLogoutFinally clears cookies and dispatches clearSession", () => {
    mocked.clearAuthCookies.mockClear();

    const actions: unknown[] = [];
    const dispatch: DispatchFn = ((a: unknown) => {
      actions.push(a);
      return a;
    }) as unknown as DispatchFn;

    onLogoutFinally(dispatch);

    expect(mocked.clearAuthCookies).toHaveBeenCalledTimes(1);

    const clearAction = actions.find((a) => {
      const r = a as { type?: unknown };
      return r && typeof r.type === "string" && r.type.endsWith("/clearSession");
    });

    expect(clearAction).toBeTruthy();
  });
});
