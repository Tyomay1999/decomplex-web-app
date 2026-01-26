import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";

import { useVacanciesInfinite } from "../useVacanciesInfinite";
import type { VacanciesPageDto } from "../../types";
import type { ListVacanciesQueryDto, VacancyEntityDto } from "../../types";

type Params = Omit<ListVacanciesQueryDto, "cursor">;

type TriggerReturn = { unwrap: () => Promise<VacanciesPageDto> };
type TriggerFn = (args: ListVacanciesQueryDto, preferCacheValue?: boolean) => TriggerReturn;

type LazyQueryState = { isFetching: boolean; isError: boolean };

const mocked = vi.hoisted(() => {
  const trigger = vi.fn<TriggerFn>();
  const state: LazyQueryState = { isFetching: false, isError: false };
  return { trigger, state };
});

vi.mock("../../vacanciesApi", () => {
  return {
    useLazyGetVacanciesQuery: (): [TriggerFn, LazyQueryState] => [mocked.trigger, mocked.state],
  };
});

const v = (id: string): VacancyEntityDto => {
  return {
    id,
    companyId: "c1",
    createdById: null,
    title: "t",
    description: "d",
    salaryFrom: null,
    salaryTo: null,
    jobType: "full_time",
    location: null,
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

describe("useVacanciesInfinite", () => {
  beforeEach(() => {
    mocked.trigger.mockReset();
    mocked.state.isFetching = false;
    mocked.state.isError = false;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("loads first page on mount", async () => {
    mocked.trigger.mockImplementation((args) => {
      const payload: VacanciesPageDto = {
        vacancies: [v("v1"), v("v2")],
        nextCursor: "c1",
      };
      expect(args.cursor).toBeNull();
      return { unwrap: async () => payload };
    });

    const { result } = renderHook(() => useVacanciesInfinite({ limit: 10 } as Params));

    await waitFor(() => {
      expect(result.current.isInitialLoading).toBe(false);
    });

    expect(result.current.items.map((x) => x.id)).toEqual(["v1", "v2"]);
    expect(result.current.nextCursor).toBe("c1");
    expect(result.current.isEndReached).toBe(false);
  });

  it("loadMore appends unique items and advances cursor", async () => {
    mocked.trigger
      .mockImplementationOnce((args) => {
        const payload: VacanciesPageDto = {
          vacancies: [v("v1"), v("v2")],
          nextCursor: "c1",
        };
        expect(args.cursor).toBeNull();
        return { unwrap: async () => payload };
      })
      .mockImplementationOnce((args) => {
        const payload: VacanciesPageDto = {
          vacancies: [v("v2"), v("v3")],
          nextCursor: null,
        };
        expect(args.cursor).toBe("c1");
        return { unwrap: async () => payload };
      });

    const { result } = renderHook(() => useVacanciesInfinite({ limit: 10 } as Params));

    await waitFor(() => {
      expect(result.current.isInitialLoading).toBe(false);
    });

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.items.map((x) => x.id).sort()).toEqual(["v1", "v2", "v3"]);
    expect(result.current.nextCursor).toBeNull();

    await waitFor(() => {
      expect(result.current.isEndReached).toBe(true);
    });
  });

  it("reload ignores stale response when params change quickly", async () => {
    const first = deferred<VacanciesPageDto>();

    mocked.trigger
      .mockImplementationOnce((args) => {
        expect(args.cursor).toBeNull();
        return { unwrap: async () => first.promise };
      })
      .mockImplementationOnce((args) => {
        const payload: VacanciesPageDto = { vacancies: [v("new")], nextCursor: null };
        expect(args.cursor).toBeNull();
        return { unwrap: async () => payload };
      });

    const { result, rerender } = renderHook(
      ({ limit }) => useVacanciesInfinite({ limit } as Params),
      { initialProps: { limit: 10 } },
    );

    await waitFor(() => {
      expect(result.current.isInitialLoading).toBe(true);
    });

    rerender({ limit: 20 });

    await waitFor(() => {
      expect(mocked.trigger).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(result.current.isInitialLoading).toBe(false);
      expect(result.current.items.map((x) => x.id)).toEqual(["new"]);
    });

    await act(async () => {
      first.resolve({ vacancies: [v("old")], nextCursor: null });
      await first.promise;
    });

    expect(result.current.items.map((x) => x.id)).toEqual(["new"]);
  });

  it("loadMore does nothing when nextCursor is null", async () => {
    mocked.trigger.mockImplementation((args) => {
      const payload: VacanciesPageDto = { vacancies: [v("v1")], nextCursor: null };
      expect(args.cursor).toBeNull();
      return { unwrap: async () => payload };
    });

    const { result } = renderHook(() => useVacanciesInfinite({ limit: 10 } as Params));

    await waitFor(() => {
      expect(result.current.isInitialLoading).toBe(false);
    });

    const callsBefore = mocked.trigger.mock.calls.length;

    await act(async () => {
      await result.current.loadMore();
    });

    expect(mocked.trigger.mock.calls.length).toBe(callsBefore);
  });

  it("loadMore does nothing while query.isFetching is true", async () => {
    mocked.trigger.mockImplementation((args) => {
      const payload: VacanciesPageDto = { vacancies: [v("v1")], nextCursor: "c1" };
      expect(args.cursor).toBeNull();
      return { unwrap: async () => payload };
    });

    const { result } = renderHook(() => useVacanciesInfinite({ limit: 10 } as Params));

    await waitFor(() => {
      expect(result.current.isInitialLoading).toBe(false);
      expect(result.current.nextCursor).toBe("c1");
    });

    mocked.state.isFetching = true;

    const callsBefore = mocked.trigger.mock.calls.length;

    await act(async () => {
      await result.current.loadMore();
    });

    expect(mocked.trigger.mock.calls.length).toBe(callsBefore);
  });
});
