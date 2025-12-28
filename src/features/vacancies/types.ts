export type VacancyStatus = "active" | "archived";
export type VacancyJobType = "full_time" | "part_time" | "remote" | "hybrid";

export type VacancyEntityDto = {
  id: string;
  companyId: string;
  createdById: string | null;
  title: string;
  description: string;
  salaryFrom: number | null;
  salaryTo: number | null;
  jobType: VacancyJobType;
  location: string | null;
  status: VacancyStatus;
  createdAt: string;
  updatedAt: string;
};

export type ListVacanciesResponseDto = {
  success: true;
  data: {
    vacancies: VacancyEntityDto[];
  };
};

export type ListVacanciesQueryDto = {
  companyId?: string;
  status?: VacancyStatus;
  jobType?: VacancyJobType;
};
