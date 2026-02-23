import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryApi,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";

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

type NetworkErrorStatus = "FETCH_ERROR" | "TIMEOUT_ERROR";

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

function getNetworkErrorMessage(): string {
  const lang = getUiLang();
  if (lang === "ru") return "Проблема с сетью.";
  if (lang === "hy") return "Ցանցային խնդիր։";
  return "Network issue.";
}

function isNetworkFetchError(
  error: FetchBaseQueryError | undefined,
): error is { status: NetworkErrorStatus; error: string } {
  if (!error) return false;
  return error.status === "FETCH_ERROR" || error.status === "TIMEOUT_ERROR";
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

function isMeRequest(args: string | FetchArgs): boolean {
  const url = toUrl(args);
  return url === "/me" || url.endsWith("/me") || url === "/auth/me" || url.endsWith("/auth/me");
}

function asSuccessNull(): ApiSuccessResponse<null> {
  return { success: true, data: null };
}

function toExtraOptions(v: unknown): Record<string, unknown> {
  return isRecord(v) ? v : {};
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

async function runRefresh(api: BaseQueryApi, extraOptions: unknown): Promise<RefreshResponseData> {
  const state = api.getState() as RootState;
  const refreshToken = state.auth.refreshToken || getRefreshTokenFromCookie();

  if (!refreshToken) {
    clearAuthCookies();
    api.dispatch(clearSession());
    throw new Error("Missing refresh token");
  }

  const refreshResult = await rawBaseQuery(
    { url: "/auth/refresh", method: "POST", body: { refreshToken } },
    api,
    toExtraOptions(extraOptions),
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

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  unknown
> = async (args, api, extraOptions) => {
  const opts = toExtraOptions(extraOptions);

  const result = await rawBaseQuery(args, api, opts);

  if (isNetworkFetchError(result.error)) {
    return {
      error: {
        status: result.error.status,
        error: getNetworkErrorMessage(),
      },
    };
  }

  const status = result.error?.status;

  if ((status === 401 || status === 403) && isMeRequest(args)) {
    clearAuthCookies();
    api.dispatch(clearSession());
    return { data: asSuccessNull() };
  }

  if (status !== 401) return result;
  if (isRefreshRequest(args)) return result;

  if (!refreshPromise) {
    refreshPromise = runRefresh(api, opts).finally(() => {
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

    return await rawBaseQuery(args, api, opts);
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
