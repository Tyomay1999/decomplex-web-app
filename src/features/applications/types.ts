import type { ApiSuccessResponse } from "@/services/types";

export type ApplicationStatusKnown =
  | "applied"
  | "pending"
  | "reviewing"
  | "approved"
  | "rejected"
  | "accepted"
  | "canceled"
  | "withdrawn";

export type ApplicationStatus = ApplicationStatusKnown | (string & {});

export type ApplicationEntityDto = {
  id: string;
  vacancyId: string;
  candidateId: string;
  cvFilePath: string;
  coverLetter: string | null;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
};

export type MyApplicationsPageDto = {
  items: ApplicationEntityDto[];
  nextCursor: string | null;
};

export type ListMyApplicationsQueryDto = {
  limit?: number;
  cursor?: string | null;
};

export type ListMyApplicationsResponseDto = ApiSuccessResponse<MyApplicationsPageDto>;
