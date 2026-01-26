import { describe, expect, it, afterEach } from "vitest";
import { http, HttpResponse } from "msw";

import { server } from "../../../test/msw/server";

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  fingerprintHash: string | null;
  user: unknown;
};

type MinimalApi = {
  getState: () => { auth: AuthState };
  dispatch: (action: unknown) => unknown;
};

type BaseQueryArgs = {
  url: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
};

type BaseQueryFn = (args: BaseQueryArgs, api: unknown, extraOptions: unknown) => Promise<unknown>;

afterEach(() => {
  document.cookie = "dc_locale=; Max-Age=0; path=/";
  document.cookie = "NEXT_LOCALE=; Max-Age=0; path=/";
});

describe("services/api Accept-Language", () => {
  it("uses dc_locale cookie when present", async () => {
    const captured: { value: string | null } = { value: null };

    server.use(
      http.get("http://localhost:9999/i18n-ping", ({ request }) => {
        captured.value = request.headers.get("accept-language");
        return HttpResponse.json({ ok: true });
      }),
    );

    document.cookie = "dc_locale=ru; path=/";

    const mod = await import("../api");
    const baseQueryWithReauth = mod.baseQueryWithReauth as unknown as BaseQueryFn;

    const api: MinimalApi = {
      getState: () => ({
        auth: {
          accessToken: null,
          refreshToken: null,
          fingerprintHash: null,
          user: null,
        },
      }),
      dispatch: () => undefined,
    };

    const result = await baseQueryWithReauth({ url: "/i18n-ping", method: "GET" }, api, undefined);

    expect((result as { error?: unknown }).error).toBeUndefined();
    expect(captured.value).toBe("ru");
  });

  it("falls back to NEXT_LOCALE cookie when dc_locale is missing", async () => {
    const captured: { value: string | null } = { value: null };

    server.use(
      http.get("http://localhost:9999/i18n-ping-2", ({ request }) => {
        captured.value = request.headers.get("accept-language");
        return HttpResponse.json({ ok: true });
      }),
    );

    document.cookie = "dc_locale=; path=/";
    document.cookie = "NEXT_LOCALE=hy; path=/";

    const mod = await import("../api");
    const baseQueryWithReauth = mod.baseQueryWithReauth as unknown as BaseQueryFn;

    const api: MinimalApi = {
      getState: () => ({
        auth: {
          accessToken: null,
          refreshToken: null,
          fingerprintHash: null,
          user: null,
        },
      }),
      dispatch: () => undefined,
    };

    const result = await baseQueryWithReauth(
      { url: "/i18n-ping-2", method: "GET" },
      api,
      undefined,
    );

    expect((result as { error?: unknown }).error).toBeUndefined();
    expect(captured.value).toBe("hy");
  });

  it("defaults to en when cookie value is missing or invalid", async () => {
    const captured: { value: string | null } = { value: null };

    server.use(
      http.get("http://localhost:9999/i18n-ping-3", ({ request }) => {
        captured.value = request.headers.get("accept-language");
        return HttpResponse.json({ ok: true });
      }),
    );

    document.cookie = "dc_locale=de; path=/";
    document.cookie = "NEXT_LOCALE=fr; path=/";

    const mod = await import("../api");
    const baseQueryWithReauth = mod.baseQueryWithReauth as unknown as BaseQueryFn;

    const api: MinimalApi = {
      getState: () => ({
        auth: {
          accessToken: null,
          refreshToken: null,
          fingerprintHash: null,
          user: null,
        },
      }),
      dispatch: () => undefined,
    };

    const result = await baseQueryWithReauth(
      { url: "/i18n-ping-3", method: "GET" },
      api,
      undefined,
    );

    expect((result as { error?: unknown }).error).toBeUndefined();
    expect(captured.value).toBe("en");
  });
});
