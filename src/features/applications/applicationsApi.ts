import { api } from "@/services/api";
import type {
  ListMyApplicationsQueryDto,
  ListMyApplicationsResponseDto,
  MyApplicationsPageDto,
} from "./types";

export const applicationsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMyApplications: builder.query<MyApplicationsPageDto, ListMyApplicationsQueryDto | void>({
      query: (params) => ({
        url: "/applications/my",
        method: "GET",
        params: params ?? undefined,
      }),
      transformResponse: (response: ListMyApplicationsResponseDto) => response.data,
    }),
  }),
  overrideExisting: false,
});

export const { useLazyGetMyApplicationsQuery, useGetMyApplicationsQuery } = applicationsApi;
