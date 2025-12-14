export type VacancyListItem = {
  id: string;
  slug?: string;
  title: string;
  location?: string;
  companyName?: string;
  publishedAt?: string;
};

export type VacancyDetails = VacancyListItem & {
  description?: string;
  employmentType?: string;
  salary?: string;
  updatedAt?: string;
};
