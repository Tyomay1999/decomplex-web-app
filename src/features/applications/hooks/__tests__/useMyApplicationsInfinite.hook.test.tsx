import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

import { useMyApplicationsInfinite } from "../useMyApplicationsInfinite";
import type { ApplicationEntityDto, MyApplicationsPageDto } from "../../types";
import type { ListMyApplicationsQueryDto } from "../../types";

type TriggerArgs = ListMyApplicationsQueryDto | undefined;
type TriggerReturn = { unwrap: () => Promise<MyApplicationsPageDto> };
type TriggerFn = (args: TriggerArgs, preferCacheValue?: boolean) => TriggerReturn;

type LazyQueryState = { isFetching: boolean; isError: boolean };

const mocked = vi.hoisted(() => {
  const trigger = vi.fn<TriggerFn>();
  const state: LazyQueryState = { isFetching: false, isError: false };
  return { trigger, state };
});

vi.mock("../../applicationsApi", () => {
  return {
    useLazyGetMyApplicationsQuery: (): [TriggerFn, LazyQueryState] => [
      mocked.trigger,
      mocked.state,
    ],
  };
});

const flush = async (): Promise<void> => {
  await Promise.resolve();
  await Promise.resolve();
};

const a = (id: string, vacancyId: string): ApplicationEntityDto => {
  return {
    id,
    vacancyId,
    candidateId: "u1",
    cvFilePath: "/cv.pdf",
    coverLetter: null,
    status: "applied",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

describe("useMyApplicationsInfinite", () => {
  it("loads first page on mount", async () => {
    mocked.state.isFetching = false;
    mocked.state.isError = false;

    mocked.trigger.mockImplementation((args) => {
      const payload: MyApplicationsPageDto = {
        items: [a("a1", "v1")],
        nextCursor: "c1",
      };
      const q = args ?? {};
      expect(q.cursor ?? null).toBeNull();
      return { unwrap: async () => payload };
    });

    const { result } = renderHook(() => useMyApplicationsInfinite({ limit: 10 }));

    await act(async () => {
      await flush();
    });

    expect(result.current.items.map((x) => x.id)).toEqual(["a1"]);
    expect(result.current.hasMore).toBe(true);
  });

  it("loadMore appends unique and updates hasMore", async () => {
    mocked.state.isFetching = false;
    mocked.state.isError = false;

    mocked.trigger
      .mockImplementationOnce((args) => {
        const payload: MyApplicationsPageDto = {
          items: [a("a1", "v1"), a("a2", "v2")],
          nextCursor: "c1",
        };
        const q = args ?? {};
        expect(q.cursor ?? null).toBeNull();
        return { unwrap: async () => payload };
      })
      .mockImplementationOnce((args) => {
        const payload: MyApplicationsPageDto = {
          items: [a("a2", "v2"), a("a3", "v3")],
          nextCursor: null,
        };
        const q = args ?? {};
        expect(q.cursor).toBe("c1");
        return { unwrap: async () => payload };
      });

    const { result } = renderHook(() => useMyApplicationsInfinite({ limit: 10 }));

    await act(async () => {
      await flush();
    });

    await act(async () => {
      await result.current.loadMore();
      await flush();
    });

    expect(result.current.items.map((x) => x.id).sort()).toEqual(["a1", "a2", "a3"]);
    expect(result.current.hasMore).toBe(false);
  });

  it("sets hasMore false on loadFirst error", async () => {
    mocked.state.isFetching = false;
    mocked.state.isError = true;

    mocked.trigger.mockImplementation(() => {
      return { unwrap: async () => Promise.reject(new Error("fail")) };
    });

    const { result } = renderHook(() => useMyApplicationsInfinite({ limit: 10 }));

    await act(async () => {
      await flush();
    });

    expect(result.current.hasMore).toBe(false);
  });
});
