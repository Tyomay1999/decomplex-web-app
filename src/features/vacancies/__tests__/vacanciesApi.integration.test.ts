import { afterEach, describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";

import { server } from "../../../../test/msw/server";
import { createTestStore } from "../../../../test/shared/store";
import { resetAuthCookiesMock, resetFingerprintMock } from "../../../../test/shared/mocks";
import { waitFor } from "../../../../test/shared/utils";
import { buildVacancy, buildVacanciesPage } from "../../../../test/shared/builders";

import { vacanciesApi } from "@/features/vacancies/vacanciesApi";
import type { ApiSuccessResponse } from "@/services/types";
import type { VacanciesPageDto, VacancyEntityDto } from "@/features/vacancies/types";

type VacancyByIdData = {
  vacancy: VacancyEntityDto;
};

afterEach(() => {
  server.resetHandlers();
  vi.restoreAllMocks();
});

describe("vacanciesApi", () => {
  it("fetches vacancies list and maps ApiSuccessResponse.data", async () => {
    resetAuthCookiesMock();
    resetFingerprintMock();

    const v1 = buildVacancy({ id: "v_1" });
    const v2 = buildVacancy({ id: "v_2" });

    const page = buildVacanciesPage({ vacancies: [v1, v2] });

    const payload: ApiSuccessResponse<VacanciesPageDto> = {
      success: true,
      data: page,
    };

    server.use(
      http.get("http://localhost:9999/vacancies", ({ request }) => {
        const url = new URL(request.url);
        const limit = url.searchParams.get("limit");
        if (limit !== null && typeof limit !== "string") {
          return new HttpResponse(null, { status: 400 });
        }
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
    });

    const action = store.dispatch(vacanciesApi.endpoints.getVacancies.initiate({} as never));
    const data = await action.unwrap();

    expect(data.vacancies.map((x) => x.id)).toEqual(["v_1", "v_2"]);

    action.unsubscribe();
    store.dispatch(vacanciesApi.util.resetApiState());
  });

  it("fetches vacancy by id and maps response.data.vacancy", async () => {
    resetAuthCookiesMock();
    resetFingerprintMock();

    const vacancy = buildVacancy({ id: "v_42" });

    const payload: ApiSuccessResponse<VacancyByIdData> = {
      success: true,
      data: { vacancy },
    };

    server.use(http.get("http://localhost:9999/vacancies/v_42", () => HttpResponse.json(payload)));

    const store = createTestStore({
      auth: {
        status: "anonymous",
        accessToken: "t",
        refreshToken: "rt",
        fingerprintHash: null,
        user: null,
      },
      notifications: { toasts: [] },
    });

    const action = store.dispatch(vacanciesApi.endpoints.getVacancyById.initiate("v_42"));
    const data = await action.unwrap();

    expect(data.id).toBe("v_42");

    action.unsubscribe();
    store.dispatch(vacanciesApi.util.resetApiState());
  });

  it("invalidates vacancies list after applyToVacancy and triggers refetch for active subscription", async () => {
    resetAuthCookiesMock();
    resetFingerprintMock();

    let listCalls = 0;

    const vacancy = buildVacancy({ id: "v_1" });
    const page = buildVacanciesPage({ vacancies: [vacancy] });

    const listPayload: ApiSuccessResponse<VacanciesPageDto> = {
      success: true,
      data: page,
    };

    const applyPayload: ApiSuccessResponse<{ success: boolean }> = {
      success: true,
      data: { success: true },
    };

    server.use(
      http.get("http://localhost:9999/vacancies", () => {
        listCalls += 1;
        return HttpResponse.json(listPayload);
      }),
      http.post("http://localhost:9999/vacancies/v_1/apply", async ({ request }) => {
        const formData = await request.formData();
        const file = formData.get("file");
        const coverLetter = formData.get("coverLetter");

        expect(coverLetter).toBe("Hello");
        expect(file instanceof File && file.name === "cv.pdf").toBe(true);

        return HttpResponse.json(applyPayload);
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
    });

    const subscription = store.dispatch(vacanciesApi.endpoints.getVacancies.initiate({} as never));
    await subscription.unwrap();

    const before = listCalls;

    const file = new File([new Uint8Array([1, 2, 3])], "cv.pdf", { type: "application/pdf" });

    const applyAction = store.dispatch(
      vacanciesApi.endpoints.applyToVacancy.initiate({
        vacancyId: "v_1",
        file,
        coverLetter: "Hello",
      }),
    );

    await applyAction.unwrap();

    await waitFor(() => listCalls > before);

    subscription.unsubscribe();
    store.dispatch(vacanciesApi.util.resetApiState());
  });
});
