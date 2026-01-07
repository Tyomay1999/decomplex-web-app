export type ApplicationStatus =
  | "applied"
  | "pending"
  | "reviewing"
  | "approved"
  | "rejected"
  | "accepted"
  | "canceled"
  | "withdrawn"
  | string;

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

export type ListMyApplicationsResponseDto = {
  success: boolean;
  data: MyApplicationsPageDto;
};
