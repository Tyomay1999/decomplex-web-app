import type { MyApplicationsPageDto } from "@/features/applications/types";

export const buildMyApplicationsPage = (
  overrides: Partial<MyApplicationsPageDto> = {},
): MyApplicationsPageDto => {
  return {
    ...(overrides as MyApplicationsPageDto),
  };
};
