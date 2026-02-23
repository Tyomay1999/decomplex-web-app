import type { Page } from "@playwright/test";
import { apiPattern, apiUrl } from "./pattern";

type UserDto = {
  id: string;
  email: string;
  role: string;
  language?: "en" | "hy" | "ru" | null;
  firstName?: string | null;
  lastName?: string | null;
  userType?: "candidate" | "company" | null;
};

type ApiSuccess<T> = { success: true; data: T };
type ApiFailure = { success: false; error?: string };

function json<T>(data: T): { status: number; contentType: string; body: string } {
  return { status: 200, contentType: "application/json", body: JSON.stringify(data) };
}

function jsonStatus<T>(
  status: number,
  data: T,
): { status: number; contentType: string; body: string } {
  return { status, contentType: "application/json", body: JSON.stringify(data) };
}

export type MockAuthOptions = {
  apiBaseUrl: string;
  locale?: "en" | "hy" | "ru";
  user?: UserDto | null;
};

export type InstalledMockAuth = {
  waitForLoggedOut: () => Promise<void>;
};

export async function installMockAuth(
  page: Page,
  opts: MockAuthOptions,
): Promise<InstalledMockAuth> {
  const pattern = apiPattern(opts.apiBaseUrl);

  let currentUser: UserDto | null = opts.user ?? null;

  const meUrl = apiUrl(opts.apiBaseUrl, "/auth/me");
  const logoutUrl = apiUrl(opts.apiBaseUrl, "/auth/logout");
  const refreshUrl = apiUrl(opts.apiBaseUrl, "/auth/refresh");

  await page.route(pattern, async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    if (method === "GET" && url === meUrl) {
      if (!currentUser) {
        const payload: ApiFailure = { success: false };
        return route.fulfill(jsonStatus(401, payload));
      }

      const payload: ApiSuccess<{ user: UserDto }> = { success: true, data: { user: currentUser } };
      return route.fulfill(json(payload));
    }

    if (method === "PATCH" && url === logoutUrl) {
      currentUser = null;

      const payload: ApiSuccess<{ success: boolean }> = { success: true, data: { success: true } };
      return route.fulfill(json(payload));
    }

    if (method === "POST" && url === refreshUrl) {
      if (!currentUser) {
        const payload: ApiFailure = { success: false };
        return route.fulfill(jsonStatus(401, payload));
      }

      const payload: ApiSuccess<{
        accessToken: string;
        refreshToken: string;
        fingerprintHash?: string | null;
        user?: UserDto;
      }> = {
        success: true,
        data: {
          accessToken: "mock_access",
          refreshToken: "mock_refresh",
          fingerprintHash: "mock_fp",
          user: currentUser,
        },
      };

      return route.fulfill(json(payload));
    }

    return route.fallback();
  });

  return {
    waitForLoggedOut: async () => {
      await page
        .waitForFunction(
          () =>
            (window as unknown as { __E2E_LOGGED_OUT_SEEN__?: boolean }).__E2E_LOGGED_OUT_SEEN__ ===
            true,
          { timeout: 20_000 },
        )
        .catch(async () => {
          await page
            .waitForFunction(
              async (url: string) => {
                try {
                  const r = await fetch(url, { method: "GET" });
                  return r.status === 401;
                } catch {
                  return false;
                }
              },
              meUrl,
              { timeout: 20_000 },
            )
            .catch(() => {});
        });
    },
  };
}

export async function installLogoutSeenBridge(page: Page): Promise<void> {
  await page.addInitScript(() => {
    (window as unknown as { __E2E_LOGGED_OUT_SEEN__?: boolean }).__E2E_LOGGED_OUT_SEEN__ = false;
  });
}
