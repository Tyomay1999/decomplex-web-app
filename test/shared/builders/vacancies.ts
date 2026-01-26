import type {
  ListVacanciesQueryDto,
  VacanciesPageDto,
  VacancyEntityDto,
  VacancyJobType,
  VacancyStatus,
} from "@/features/vacancies/types";

type VacancyArgs = Partial<VacancyEntityDto> & Pick<VacancyEntityDto, "id">;

const isoNow = (): string => new Date().toISOString();

export const buildVacancy = (args: VacancyArgs): VacancyEntityDto => {
  const status: VacancyStatus = args.status ?? "active";
  const jobType: VacancyJobType = args.jobType ?? "full_time";

  return {
    id: args.id,
    companyId: args.companyId ?? "c_1",
    createdById: args.createdById ?? null,
    title: args.title ?? "Frontend Developer",
    description: args.description ?? "Role description",
    salaryFrom: args.salaryFrom ?? null,
    salaryTo: args.salaryTo ?? null,
    jobType,
    location: args.location ?? "Yerevan",
    status,
    createdAt: args.createdAt ?? isoNow(),
    updatedAt: args.updatedAt ?? isoNow(),
    ...(typeof args.hasApplied === "boolean" ? { hasApplied: args.hasApplied } : {}),
  };
};

export const buildVacanciesPage = (args: {
  vacancies?: VacancyEntityDto[];
  nextCursor?: string | null;
}): VacanciesPageDto => {
  return {
    vacancies: args.vacancies ?? [],
    nextCursor: args.nextCursor ?? null,
  };
};

export const buildListVacanciesQuery = (
  args: Partial<ListVacanciesQueryDto> & Pick<ListVacanciesQueryDto, "limit">,
): ListVacanciesQueryDto => {
  return {
    limit: args.limit,
    companyId: args.companyId,
    status: args.status,
    jobType: args.jobType,
    cursor: args.cursor,
  };
};
