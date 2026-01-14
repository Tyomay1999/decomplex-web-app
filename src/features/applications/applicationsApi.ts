import { api } from "@/services/api";
import type { ApiSuccessResponse } from "@/services/types";
import type { ListMyApplicationsQueryDto, MyApplicationsPageDto } from "./types";

export const applicationsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMyApplications: builder.query<MyApplicationsPageDto, ListMyApplicationsQueryDto | undefined>(
      {
        query: (params) => ({ url: "/applications/my", method: "GET", params }),
        transformResponse: (response: ApiSuccessResponse<MyApplicationsPageDto>) => response.data,
        providesTags: (result) => {
          const base = [{ type: "MyApplications" as const, id: "LIST" }];
          const items =
            result?.items?.map((a) => ({ type: "MyApplications" as const, id: a.id })) ?? [];
          return [...base, ...items];
        },
      },
    ),
  }),
  overrideExisting: false,
});

export const { useLazyGetMyApplicationsQuery, useGetMyApplicationsQuery } = applicationsApi;
