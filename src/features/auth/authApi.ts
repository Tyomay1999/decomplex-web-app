import { api } from "../../services/api";
import { setAuthCookies, getRefreshTokenFromCookie, clearAuthCookies } from "../../lib/authCookies";
import { clearSession, setCredentials } from "./authSlice";
import { getOrCreateFingerprint } from "../../lib/fingerprint";
import { UserDto } from "./types";

type ApiSuccessResponse<T> = { success: boolean; data: T };

export type CompanyDto = {
  id: string;
  name: string;
  defaultLocale?: string | null;
  status?: string | null;
};

export type LoginRequest = {
  email: string;
  password: string;
  rememberUser?: boolean;
  language?: string;
  companyId?: string;
  fingerprint?: string;
};

export type LoginResponseData = {
  accessToken: string;
  refreshToken: string;
  fingerprintHash: string;
  user: UserDto;
  company?: CompanyDto | null;
};

export type CurrentResponseData = {
  user: UserDto;
  company?: CompanyDto | null;
};

// type LogoutOk = { success: true };

// type BQResult<T> = QueryReturnValue<T, FetchBaseQueryError, FetchBaseQueryMeta>;

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponseData, LoginRequest>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiSuccessResponse<LoginResponseData>) => response.data,
      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;

          getOrCreateFingerprint(data.fingerprintHash || "");

          setAuthCookies(data.accessToken, data.refreshToken);

          dispatch(
            setCredentials({
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              fingerprintHash: data.fingerprintHash,
              user: data.user,
            }),
          );
        } catch {
          // handled by UI
        }
      },
    }),

    current: builder.query<CurrentResponseData, void>({
      query: () => ({
        url: "/auth/current",
        method: "GET",
      }),
      transformResponse: (response: ApiSuccessResponse<CurrentResponseData>) => response.data,
    }),

    logout: builder.mutation<{ success: boolean }, void>({
      query: () => {
        const refreshToken = getRefreshTokenFromCookie();

        return {
          url: "/auth/logout",
          method: "PATCH",
          body: refreshToken ? { refreshToken } : {},
        };
      },
      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
          await queryFulfilled;
        } finally {
          clearAuthCookies();
          dispatch(clearSession());
        }
      },
    }),
  }),
  overrideExisting: false,
});

export const { useLoginMutation, useLogoutMutation, useCurrentQuery } = authApi;
