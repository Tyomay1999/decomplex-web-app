import { api } from "@/services/api";
import type {
  GetVacancyByIdResponseDto,
  ListVacanciesQueryDto,
  ListVacanciesResponseDto,
  VacanciesPageDto,
  VacancyEntityDto,
} from "./types";

export const vacanciesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getVacancies: builder.query<VacanciesPageDto, ListVacanciesQueryDto>({
      query: (params) => ({
        url: "/vacancies",
        method: "GET",
        params,
      }),
      transformResponse: (response: ListVacanciesResponseDto) => response.data,
    }),

    getVacancyById: builder.query<VacancyEntityDto, string>({
      query: (id) => ({
        url: `/vacancies/${id}`,
        method: "GET",
      }),
      transformResponse: (response: GetVacancyByIdResponseDto) => response.data.vacancy,
    }),

    applyToVacancy: builder.mutation<
      { success: boolean },
      { vacancyId: string; file: File; coverLetter?: string }
    >({
      query: ({ vacancyId, file, coverLetter }) => {
        const formData = new FormData();
        formData.append("file", file);
        if (coverLetter) formData.append("coverLetter", coverLetter);

        return {
          url: `/vacancies/${vacancyId}/apply`,
          method: "POST",
          body: formData,
        };
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetVacanciesQuery,
  useLazyGetVacanciesQuery,
  useGetVacancyByIdQuery,
  useApplyToVacancyMutation,
} = vacanciesApi;
