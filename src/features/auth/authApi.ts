import { api } from "../../services/api";
import { setAuthCookies, getRefreshTokenFromCookie, clearAuthCookies } from "../../lib/authCookies";
import { clearSession, setCredentials } from "./authSlice";
import { getOrCreateFingerprint } from "../../lib/fingerprint";
import type { UserDto } from "./types";
import type { RootState } from "../../store/store";

export type MeResponseData = {
  user: UserDto;
  company?: CompanyDto | null;
};

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
  userType: "candidate" | "company";
  user: UserDto;
  company?: CompanyDto | null;
};

export type CurrentResponseData = {
  user: UserDto;
  company?: CompanyDto | null;
};

export type RegisterCandidateRequest = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  language?: string;
};

export type RegisterCandidateResponseData = {
  accessToken: string;
  refreshToken: string;
  fingerprintHash: string;
  user: UserDto;
};

export type RegisterCompanyRequest = {
  name: string;
  email: string;
  password: string;
  defaultLocale?: "am" | "ru" | "en";
  adminLanguage?: "am" | "ru" | "en";
  fingerprint?: string;
};

export type RegisterCompanyResponseData = {
  accessToken: string;
  refreshToken: string;
  fingerprintHash?: string | null;
  user: UserDto & { position?: string | null };
  company: CompanyDto & { email?: string };
};

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

    registerCandidate: builder.mutation<RegisterCandidateResponseData, RegisterCandidateRequest>({
      query: (body) => ({
        url: "/auth/register/candidate",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiSuccessResponse<RegisterCandidateResponseData>) =>
        response.data,
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

    registerCompany: builder.mutation<RegisterCompanyResponseData, RegisterCompanyRequest>({
      query: (body) => ({
        url: "/auth/register/company",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiSuccessResponse<RegisterCompanyResponseData>) =>
        response.data,
      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;

          const fp = data.fingerprintHash ?? null;
          if (fp) getOrCreateFingerprint(fp);

          setAuthCookies(data.accessToken, data.refreshToken);

          dispatch(
            setCredentials({
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              fingerprintHash: fp,
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
      async onQueryStarted(_arg, { queryFulfilled, dispatch, getState }) {
        try {
          const { data } = await queryFulfilled;
          const state = getState() as RootState;

          dispatch(
            setCredentials({
              accessToken: state.auth.accessToken,
              refreshToken: state.auth.refreshToken,
              fingerprintHash: state.auth.fingerprintHash,
              user: data.user,
            }),
          );
        } catch {
          // handled by UI
        }
      },
    }),

    me: builder.query<MeResponseData, void>({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),
      transformResponse: (response: ApiSuccessResponse<MeResponseData>) => response.data,
      async onQueryStarted(_arg, { queryFulfilled, dispatch, getState }) {
        try {
          const { data } = await queryFulfilled;
          const state = getState() as RootState;

          dispatch(
            setCredentials({
              accessToken: state.auth.accessToken,
              refreshToken: state.auth.refreshToken,
              fingerprintHash: state.auth.fingerprintHash,
              user: data.user,
            }),
          );
        } catch {
          // handled by UI
        }
      },
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

export const {
  useLoginMutation,
  useRegisterCandidateMutation,
  useRegisterCompanyMutation,
  useLogoutMutation,
  useCurrentQuery,
  useMeQuery,
} = authApi;
