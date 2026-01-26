import { describe, it, expect, vi, afterEach } from "vitest";
import type { MockedFunction } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { useVacancyMetaMap } from "../useVacancyMetaMap";
import type { ApplicationEntityDto } from "@/features/applications/types";

type VacancyEntityDto = {
  id: string;
  title?: string | null;
  companyId?: string | null;
  location?: string | null;
  jobType?: string | null;
};

type VacancyMeta = {
  title: string;
  companyName: string;
  location: string;
  jobType: string;
};

type FetchOk = { data: VacancyEntityDto };
type FetchNoData = { data: null };
type FetchErr = { error: { message: string } };
type FetchResult = FetchOk | FetchNoData | FetchErr;

type FetchVacancy = (id: string, preferCacheValue: true) => Promise<FetchResult>;

function makeApp(input: { id: string; vacancyId: string }): ApplicationEntityDto {
  return {
    id: input.id,
    vacancyId: input.vacancyId,
    candidateId: "c1",
    status: "submitted",
    cvFilePath: "cv.pdf",
    coverLetter: "",
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  };
}

const h = vi.hoisted(() => {
  const fetchVacancyMock = vi.fn(
    async (_id: string, _preferCacheValue: true): Promise<FetchResult> => ({ data: null }),
  ) as MockedFunction<FetchVacancy>;

  const useLazyGetVacancyByIdQuery = (): readonly [FetchVacancy] => [fetchVacancyMock];

  return { fetchVacancy: fetchVacancyMock, useLazyGetVacancyByIdQuery };
});

vi.mock("@/features/vacancies", () => ({
  useLazyGetVacancyByIdQuery: () => h.useLazyGetVacancyByIdQuery(),
}));

async function flushMicrotasks(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe("useVacancyMetaMap", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("deduplicates vacancy ids and fetches only missing meta", async () => {
    const apps: ApplicationEntityDto[] = [
      makeApp({ id: "a1", vacancyId: "v1" }),
      makeApp({ id: "a2", vacancyId: "v1" }),
      makeApp({ id: "a3", vacancyId: "v2" }),
    ];

    const v1: VacancyEntityDto = {
      id: "v1",
      title: "T1",
      companyId: "C1",
      location: "L1",
      jobType: "J1",
    };
    const v2: VacancyEntityDto = {
      id: "v2",
      title: "T2",
      companyId: "C2",
      location: "L2",
      jobType: "J2",
    };

    h.fetchVacancy.mockImplementation(async (id: string) => {
      if (id === "v1") return { data: v1 };
      if (id === "v2") return { data: v2 };
      return { error: { message: "not_found" } };
    });

    const { result, rerender } = renderHook(({ applications }) => useVacancyMetaMap(applications), {
      initialProps: { applications: apps },
    });

    await act(async () => {
      await flushMicrotasks();
    });

    expect(h.fetchVacancy).toHaveBeenCalledTimes(2);
    expect(h.fetchVacancy).toHaveBeenCalledWith("v1", true);
    expect(h.fetchVacancy).toHaveBeenCalledWith("v2", true);

    const meta1: VacancyMeta | undefined = result.current.metaByVacancyId["v1"];
    const meta2: VacancyMeta | undefined = result.current.metaByVacancyId["v2"];

    expect(meta1).toEqual({ title: "T1", companyName: "C1", location: "L1", jobType: "J1" });
    expect(meta2).toEqual({ title: "T2", companyName: "C2", location: "L2", jobType: "J2" });

    rerender({ applications: apps });

    await act(async () => {
      await flushMicrotasks();
    });

    expect(h.fetchVacancy).toHaveBeenCalledTimes(2);
  });

  it("ignores results without data and does not create meta entries", async () => {
    const apps: ApplicationEntityDto[] = [makeApp({ id: "a1", vacancyId: "v1" })];

    h.fetchVacancy.mockResolvedValueOnce({ data: null });

    const { result } = renderHook(() => useVacancyMetaMap(apps));

    await act(async () => {
      await flushMicrotasks();
    });

    expect(h.fetchVacancy).toHaveBeenCalledTimes(1);
    expect(result.current.metaByVacancyId["v1"]).toBeUndefined();
  });

  it("builds sorted unique location and jobType options and excludes blanks", async () => {
    const apps: ApplicationEntityDto[] = [
      makeApp({ id: "a1", vacancyId: "v1" }),
      makeApp({ id: "a2", vacancyId: "v2" }),
      makeApp({ id: "a3", vacancyId: "v3" }),
    ];

    const v1: VacancyEntityDto = {
      id: "v1",
      title: "T1",
      companyId: "C1",
      location: "Berlin",
      jobType: "Contract",
    };
    const v2: VacancyEntityDto = {
      id: "v2",
      title: "T2",
      companyId: "C2",
      location: "Amsterdam",
      jobType: "Full-time",
    };
    const v3: VacancyEntityDto = {
      id: "v3",
      title: "T3",
      companyId: "C3",
      location: "  ",
      jobType: "",
    };

    h.fetchVacancy.mockImplementation(async (id: string) => {
      if (id === "v1") return { data: v1 };
      if (id === "v2") return { data: v2 };
      if (id === "v3") return { data: v3 };
      return { error: { message: "not_found" } };
    });

    const { result } = renderHook(() => useVacancyMetaMap(apps));

    await act(async () => {
      await flushMicrotasks();
    });

    expect(result.current.locationOptions).toEqual([
      { value: "Amsterdam", label: "Amsterdam" },
      { value: "Berlin", label: "Berlin" },
    ]);

    expect(result.current.jobTypeOptions).toEqual([
      { value: "Contract", label: "Contract" },
      { value: "Full-time", label: "Full-time" },
    ]);
  });
});
