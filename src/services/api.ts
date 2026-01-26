import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";

import { env } from "@/config/env";
import type { RootState } from "@/store/store";
import { clearSession, patchSession } from "@/features/auth/authSlice";
import type { UserDto } from "@/features/auth/types";
import type { Locale } from "@/i18n/config";
import {
  clearAuthCookies,
  getAccessTokenFromCookie,
  getRefreshTokenFromCookie,
  setAuthCookies,
} from "@/lib/authCookies";
import { getOrCreateFingerprint } from "@/lib/fingerprint";
import type { ApiSuccessResponse } from "@/services/types";

type RefreshResponseData = {
  accessToken: string;
  refreshToken: string;
  fingerprintHash?: string | null;
  user?: UserDto;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isApiSuccessResponse<T>(v: unknown): v is ApiSuccessResponse<T> {
  if (!isRecord(v)) return false;
  return typeof v.success === "boolean" && "data" in v;
}

function getUiLang(): Locale {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(/(?:^|;\s*)(?:dc_locale|NEXT_LOCALE)=([^;]+)/);
  const v = match ? decodeURIComponent(match[1]) : "en";
  return v === "en" || v === "hy" || v === "ru" ? v : "en";
}

function getRootState(getState: () => unknown): RootState {
  return getState() as RootState;
}

function toUrl(args: string | FetchArgs): string {
  return typeof args === "string" ? args : args.url;
}

function isRefreshRequest(args: string | FetchArgs): boolean {
  const url = toUrl(args);
  return url === "/auth/refresh" || url.endsWith("/auth/refresh");
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: env.apiBaseUrl,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const state = getRootState(getState);

    const token = state.auth.accessToken || getAccessTokenFromCookie();
    if (token) headers.set("Authorization", `Bearer ${token}`);

    headers.set("Accept-Language", getUiLang());

    const fp = state.auth.fingerprintHash || getOrCreateFingerprint();
    if (fp) headers.set("X-Client-Fingerprint", fp);

    return headers;
  },
});

let refreshPromise: Promise<RefreshResponseData> | null = null;

async function runRefresh(
  api: { getState: () => unknown; dispatch: (action: unknown) => void },
  extraOptions: unknown,
): Promise<RefreshResponseData> {
  const state = api.getState() as RootState;
  const refreshToken = state.auth.refreshToken || getRefreshTokenFromCookie();

  if (!refreshToken) {
    clearAuthCookies();
    api.dispatch(clearSession());
    throw new Error("Missing refresh token");
  }

  const refreshResult = await rawBaseQuery(
    { url: "/auth/refresh", method: "POST", body: { refreshToken } },
    api as never,
    extraOptions as never,
  );

  const payload: unknown = refreshResult.data;

  if (!isApiSuccessResponse<RefreshResponseData>(payload)) {
    clearAuthCookies();
    api.dispatch(clearSession());
    throw new Error("Invalid refresh response");
  }

  const accessToken = payload.data.accessToken ?? null;
  const newRefreshToken = payload.data.refreshToken ?? null;

  if (!accessToken || !newRefreshToken) {
    clearAuthCookies();
    api.dispatch(clearSession());
    throw new Error("Invalid tokens in refresh response");
  }

  return {
    accessToken,
    refreshToken: newRefreshToken,
    fingerprintHash: payload.data.fingerprintHash ?? null,
    user: payload.data.user,
  };
}

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status !== 401) return result;
  if (isRefreshRequest(args)) return result;

  if (!refreshPromise) {
    refreshPromise = runRefresh(api, extraOptions).finally(() => {
      refreshPromise = null;
    });
  }

  try {
    const refreshed = await refreshPromise;
    const state = api.getState() as RootState;

    setAuthCookies(refreshed.accessToken, refreshed.refreshToken);

    api.dispatch(
      patchSession({
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken,
        fingerprintHash: (refreshed.fingerprintHash ?? state.auth.fingerprintHash) || null,
        user: refreshed.user ?? state.auth.user,
      }),
    );

    return await rawBaseQuery(args, api, extraOptions);
  } catch {
    return result;
  }
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Vacancies", "Vacancy", "MyApplications"],
  endpoints: () => ({}),
});

export { baseQueryWithReauth };
