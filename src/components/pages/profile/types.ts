import type { ApplicationEntityDto } from "@/features/applications/types";
import type { VacancyEntityDto } from "@/features/vacancies/types";

export type UiProfile = {
  fullName: string;
  email: string;
  userType: "candidate" | "company";
  memberSinceIso: string | null;
};

export type VacancyMeta = {
  title: string;
  companyName: string;
  location: string;
  jobType: string;
};

export type ProfileApplicationsLabels = {
  searchPlaceholder: string;
  loadMore: string;
  loading: string;
  retry: string;

  filterAll: string;
  filterReset: string;
  filterLocation: string;
  filterJobType: string;
  loadErrorTitle: string;
  loadErrorBody: string;
};

export type ProfileApplicationsCardProps = {
  title: string;
  emptyText: string;

  applications: ApplicationEntityDto[];

  isLoading: boolean;
  isError: boolean;

  hasMore: boolean;
  isFetchingMore: boolean;
  onLoadMore: () => void;
  onRetry: () => void;

  labels: ProfileApplicationsLabels;

  statusLabels: Record<string, string>;
  appliedLabel: (dateStr: string) => string;
};

export type VacancyMetaSource = Pick<
  VacancyEntityDto,
  "title" | "location" | "jobType" | "status" | "companyId"
>;
