import { api } from "@/services/api";
import type { ApiSuccessResponse } from "@/services/types";
import { getRefreshTokenFromCookie } from "@/lib/authCookies";
import type {
  CurrentResponseData,
  LoginRequest,
  LoginResponseData,
  LogoutResponse,
  MeResponseData,
  RegisterCandidateRequest,
  RegisterCandidateResponseData,
  RegisterCompanyRequest,
  RegisterCompanyResponseData,
} from "./types";
import {
  onCurrentOrMeSuccess,
  onLoginSuccess,
  onLogoutFinally,
  onRegisterCandidateSuccess,
  onRegisterCompanySuccess,
} from "./authHandlers";

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponseData, LoginRequest>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      transformResponse: (response: ApiSuccessResponse<LoginResponseData>) => response.data,
      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          onLoginSuccess(dispatch, data);
        } catch {
          return;
        }
      },
    }),

    registerCandidate: builder.mutation<RegisterCandidateResponseData, RegisterCandidateRequest>({
      query: (body) => ({ url: "/auth/register/candidate", method: "POST", body }),
      transformResponse: (response: ApiSuccessResponse<RegisterCandidateResponseData>) =>
        response.data,
      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          onRegisterCandidateSuccess(dispatch, data);
        } catch {
          return;
        }
      },
    }),

    registerCompany: builder.mutation<RegisterCompanyResponseData, RegisterCompanyRequest>({
      query: (body) => ({ url: "/auth/register/company", method: "POST", body }),
      transformResponse: (response: ApiSuccessResponse<RegisterCompanyResponseData>) =>
        response.data,
      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          onRegisterCompanySuccess(dispatch, data);
        } catch {
          return;
        }
      },
    }),

    current: builder.query<CurrentResponseData, void>({
      query: () => ({ url: "/auth/current", method: "GET" }),
      transformResponse: (response: ApiSuccessResponse<CurrentResponseData>) => response.data,
      async onQueryStarted(_arg, { queryFulfilled, dispatch, getState }) {
        try {
          const { data } = await queryFulfilled;
          onCurrentOrMeSuccess(dispatch, getState, data);
        } catch {
          return;
        }
      },
    }),

    me: builder.query<MeResponseData, void>({
      query: () => ({ url: "/auth/me", method: "GET" }),
      transformResponse: (response: ApiSuccessResponse<MeResponseData>) => response.data,
      async onQueryStarted(_arg, { queryFulfilled, dispatch, getState }) {
        try {
          const { data } = await queryFulfilled;
          onCurrentOrMeSuccess(dispatch, getState, data);
        } catch {
          return;
        }
      },
    }),

    logout: builder.mutation<LogoutResponse, void>({
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
        } catch {
          // intentionally ignore
        } finally {
          onLogoutFinally(dispatch);
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
  useMeQuery,
} = authApi;
