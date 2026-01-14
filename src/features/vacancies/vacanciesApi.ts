import { api } from "@/services/api";
import type { ApiSuccessResponse } from "@/services/types";
import type { ListVacanciesQueryDto, VacanciesPageDto, VacancyEntityDto } from "./types";

type VacancyByIdData = { vacancy: VacancyEntityDto };

export type ApplyToVacancyRequest = {
  vacancyId: string;
  file: File;
  coverLetter?: string;
};

export type ApplyToVacancyResponse = { success: boolean };

export const vacanciesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getVacancies: builder.query<VacanciesPageDto, ListVacanciesQueryDto>({
      query: (params) => ({ url: "/vacancies", method: "GET", params }),
      transformResponse: (response: ApiSuccessResponse<VacanciesPageDto>) => response.data,
      providesTags: (result) => {
        const base = [{ type: "Vacancies" as const, id: "LIST" }];
        const items = result?.vacancies?.map((v) => ({ type: "Vacancy" as const, id: v.id })) ?? [];
        return [...base, ...items];
      },
    }),

    getVacancyById: builder.query<VacancyEntityDto, string>({
      query: (id) => ({ url: `/vacancies/${id}`, method: "GET" }),
      transformResponse: (response: ApiSuccessResponse<VacancyByIdData>) => response.data.vacancy,
      providesTags: (_res, _err, id) => [{ type: "Vacancy", id }],
    }),

    applyToVacancy: builder.mutation<ApplyToVacancyResponse, ApplyToVacancyRequest>({
      query: ({ vacancyId, file, coverLetter }) => {
        const formData = new FormData();
        formData.append("file", file);
        if (coverLetter) formData.append("coverLetter", coverLetter);

        return { url: `/vacancies/${vacancyId}/apply`, method: "POST", body: formData };
      },
      transformResponse: (response: ApiSuccessResponse<ApplyToVacancyResponse>) => response.data,
      invalidatesTags: (_res, _err, arg) => [
        { type: "Vacancy", id: arg.vacancyId },
        { type: "Vacancies", id: "LIST" },
        { type: "MyApplications", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetVacanciesQuery,
  useLazyGetVacancyByIdQuery,
  useLazyGetVacanciesQuery,
  useGetVacancyByIdQuery,
  useApplyToVacancyMutation,
} = vacanciesApi;
