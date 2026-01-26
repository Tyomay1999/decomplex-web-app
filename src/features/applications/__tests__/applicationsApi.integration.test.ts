import { describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";

import { server } from "../../../../test/msw/server";
import { createTestStore } from "../../../../test/shared/store";
import { resetAuthCookiesMock, resetFingerprintMock } from "../../../../test/shared/mocks";
import { buildMyApplicationsPage } from "../../../../test/shared/builders";

import { applicationsApi } from "@/features/applications/applicationsApi";
import type { ApiSuccessResponse } from "@/services/types";
import type { MyApplicationsPageDto } from "@/features/applications/types";

describe("applicationsApi", () => {
  it("fetches my applications and maps ApiSuccessResponse.data", async () => {
    resetAuthCookiesMock();
    resetFingerprintMock();
    vi.resetModules();

    const page = buildMyApplicationsPage({
      items: [],
    } as Partial<MyApplicationsPageDto>);

    const payload: ApiSuccessResponse<MyApplicationsPageDto> = {
      success: true,
      data: page,
    };

    server.use(
      http.get("http://localhost:9999/applications/my", () => {
        return HttpResponse.json(payload);
      }),
    );

    const store = createTestStore({
      auth: {
        status: "anonymous",
        accessToken: "t",
        refreshToken: "rt",
        fingerprintHash: null,
        user: null,
      },
      notifications: { toasts: [] },
      api: {},
    });

    const action = store.dispatch(applicationsApi.endpoints.getMyApplications.initiate(undefined));
    const data = await action.unwrap();

    expect(Array.isArray((data as { items?: unknown }).items)).toBe(true);

    action.unsubscribe();
  });
});
