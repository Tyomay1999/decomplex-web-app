import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { env } from "../config/env";
import type { RootState } from "../store/store";
import {
  getAccessTokenFromCookie,
  getRefreshTokenFromCookie,
  setAuthCookies,
  clearAuthCookies,
} from "../lib/authCookies";
import { clearSession, setCredentials } from "../features/auth/authSlice";
import { UserDto } from "../features/auth/types";

type ApiSuccessResponse<T> = { success: boolean; data: T };

type RefreshResponseData = {
  accessToken: string;
  refreshToken: string;
  fingerprintHash?: string | null;
  user?: UserDto;
};

function getLang(): string {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(/(?:^|;\s*)(?:dc_locale|NEXT_LOCALE)=([^;]+)/);
  const v = match ? decodeURIComponent(match[1]) : "en";
  return v === "en" || v === "hy" || v === "ru" ? v : "en";
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: env.apiBaseUrl,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;

    const token = state.auth.accessToken || getAccessTokenFromCookie();
    if (token) headers.set("Authorization", `Bearer ${token}`);

    headers.set("Accept-Language", getLang());

    const fp = state.auth.fingerprintHash;
    if (fp) headers.set("X-Client-Fingerprint", fp);

    headers.set("Content-Type", "application/json");
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const state = api.getState() as RootState;
    const refreshToken = state.auth.refreshToken || getRefreshTokenFromCookie();

    if (!refreshToken) {
      clearAuthCookies();
      api.dispatch(clearSession());
      return result;
    }

    const refreshResult = await rawBaseQuery(
      {
        url: "/auth/refresh",
        method: "POST",
        body: { refreshToken },
      },
      api,
      extraOptions,
    );

    if (refreshResult.data) {
      const parsed = refreshResult.data as ApiSuccessResponse<RefreshResponseData>;

      const accessToken = parsed.data.accessToken ?? null;
      const newRefreshToken = parsed.data.refreshToken ?? null;

      if (accessToken && newRefreshToken) {
        setAuthCookies(accessToken, newRefreshToken);

        const current = api.getState() as RootState;

        api.dispatch(
          setCredentials({
            accessToken,
            refreshToken: newRefreshToken,
            fingerprintHash: (parsed.data.fingerprintHash ?? current.auth.fingerprintHash) || null,
            user: parsed.data.user ?? current.auth.user,
          }),
        );

        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        clearAuthCookies();
        api.dispatch(clearSession());
      }
    } else {
      clearAuthCookies();
      api.dispatch(clearSession());
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
});
