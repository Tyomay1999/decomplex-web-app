import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { MockedFunction } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { useHomeVacancies } from "../useHomeVacancies";
import type { VacancyJobType } from "@/features/vacancies/types";

type VacancyEntityDto = {
  id: string;
  title: string;
  companyId: string;
  location?: string | null;
  createdAt: string;
};

type VacanciesInfiniteReturn = {
  items: VacancyEntityDto[] | null;
  isFetching: boolean;
  isError: boolean;
  isInitialLoading: boolean;
  isEndReached: boolean;
  loadMore: () => void;
  reload: () => void;
};

type TFn = (key: string, values?: Record<string, unknown>) => string;

type ListParams = {
  status: "active";
  limit: number;
  jobType?: VacancyJobType;
  q?: string;
};

const h = vi.hoisted(() => {
  const reload: MockedFunction<() => void> = vi.fn();
  const loadMore: MockedFunction<() => void> = vi.fn();

  const state: { ret: VacanciesInfiniteReturn } = {
    ret: {
      items: [],
      isFetching: false,
      isError: false,
      isInitialLoading: false,
      isEndReached: false,
      loadMore,
      reload,
    },
  };

  const t: TFn = (key, values) => {
    if (key === "unknownLocation") return "UNKNOWN_LOCATION";
    if (key === "count") return `COUNT:${String(values?.count ?? "")}`;
    if (key === "posted.minutesAgo") return `MINUTES_AGO:${String(values?.count ?? "")}`;
    if (key === "posted.hoursAgo") return `HOURS_AGO:${String(values?.count ?? "")}`;
    if (key === "posted.daysAgo") return `DAYS_AGO:${String(values?.count ?? "")}`;
    return key;
  };

  return { state, reload, loadMore, t };
});

vi.mock("@/features/vacancies/hooks", () => ({
  useVacanciesInfinite: () => h.state.ret,
}));

vi.mock("next-intl", () => ({
  useTranslations: () => h.t,
}));

describe("useHomeVacancies", () => {
  beforeEach(() => {
    vi.spyOn(Date, "now").mockReturnValue(new Date("2026-01-22T12:00:00.000Z").getTime());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("maps entities to UI items and falls back to unknown location", () => {
    const items: VacancyEntityDto[] = [
      {
        id: "v1",
        title: "Frontend",
        companyId: "c1",
        location: null,
        createdAt: "2026-01-22T11:59:00.000Z",
      },
      {
        id: "v2",
        title: "Backend",
        companyId: "c2",
        location: "Yerevan",
        createdAt: "2026-01-21T12:00:00.000Z",
      },
    ];

    h.state.ret = {
      ...h.state.ret,
      items,
    };

    const params: ListParams = { status: "active", limit: 20 };

    const { result } = renderHook(() => useHomeVacancies(params));

    expect(result.current.uiVacancies).toEqual([
      {
        id: "v1",
        title: "Frontend",
        companyId: "c1",
        location: "UNKNOWN_LOCATION",
        postedLabel: "MINUTES_AGO:1",
      },
      {
        id: "v2",
        title: "Backend",
        companyId: "c2",
        location: "Yerevan",
        postedLabel: "DAYS_AGO:1",
      },
    ]);
  });

  it("builds count label from UI items length", () => {
    const items: VacancyEntityDto[] = [
      {
        id: "v1",
        title: "Frontend",
        companyId: "c1",
        location: "X",
        createdAt: "2026-01-22T11:00:00.000Z",
      },
      {
        id: "v2",
        title: "Backend",
        companyId: "c2",
        location: "Y",
        createdAt: "2026-01-22T10:00:00.000Z",
      },
    ];

    h.state.ret = { ...h.state.ret, items };

    const { result } = renderHook(() => useHomeVacancies({ status: "active", limit: 20 }));

    expect(result.current.countLabel).toBe("COUNT:2");
  });

  it("passes through flags and actions and triggers reload via onSearchClick", () => {
    h.state.ret = {
      items: [],
      isFetching: true,
      isError: false,
      isInitialLoading: true,
      isEndReached: true,
      loadMore: h.loadMore,
      reload: h.reload,
    };

    const { result } = renderHook(() => useHomeVacancies({ status: "active", limit: 20 }));

    expect(result.current.isFetching).toBe(true);
    expect(result.current.isError).toBe(false);
    expect(result.current.isInitialLoading).toBe(true);
    expect(result.current.isEndReached).toBe(true);

    act(() => {
      result.current.loadMore();
    });
    expect(h.loadMore).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.onSearchClick();
    });
    expect(h.reload).toHaveBeenCalledTimes(1);
  });

  it("uses hours label when diff is below one day", () => {
    h.state.ret = {
      ...h.state.ret,
      items: [
        {
          id: "v1",
          title: "QA",
          companyId: "c1",
          location: "X",
          createdAt: "2026-01-22T10:00:00.000Z",
        },
      ],
    };

    const { result } = renderHook(() => useHomeVacancies({ status: "active", limit: 20 }));

    expect(result.current.uiVacancies[0]?.postedLabel).toBe("HOURS_AGO:2");
  });
});
