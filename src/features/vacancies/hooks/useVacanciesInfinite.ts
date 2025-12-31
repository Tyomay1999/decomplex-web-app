"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ListVacanciesQueryDto, VacancyEntityDto } from "../types";
import { useLazyGetVacanciesQuery } from "../vacanciesApi";

type Params = Omit<ListVacanciesQueryDto, "cursor">;

function uniqById(items: VacancyEntityDto[]): VacancyEntityDto[] {
  const map = new Map<string, VacancyEntityDto>();
  for (const it of items) map.set(it.id, it);
  return Array.from(map.values());
}

export function useVacanciesInfinite(params: Params) {
  const [trigger, { isFetching, isError }] = useLazyGetVacanciesQuery();

  const [items, setItems] = useState<VacancyEntityDto[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  const paramsKey = useMemo(() => JSON.stringify(params), [params]);
  const isEndReached = nextCursor === null && !isInitialLoading && items.length > 0;

  const resetRef = useRef(0);

  const loadFirst = useCallback(async () => {
    const stamp = ++resetRef.current;

    setIsInitialLoading(true);
    setItems([]);
    setNextCursor(null);

    try {
      const res = await trigger({ ...params, cursor: undefined }, true).unwrap();
      if (resetRef.current !== stamp) return;

      setItems(res?.vacancies);
      setNextCursor(res?.nextCursor);
    } finally {
      if (resetRef.current === stamp) setIsInitialLoading(false);
    }
  }, [params, trigger]);

  const loadMore = useCallback(async () => {
    if (isFetching) return;
    if (!nextCursor) return;

    const res = await trigger({ ...params, cursor: nextCursor }, true).unwrap();
    setItems((prev) => uniqById([...prev, ...res.vacancies]));
    setNextCursor(res.nextCursor);
  }, [isFetching, nextCursor, params, trigger]);

  useEffect(() => {
    loadFirst();
  }, [paramsKey]);

  return {
    items,
    nextCursor,
    isFetching,
    isError,
    isInitialLoading,
    isEndReached,
    loadMore,
    reload: loadFirst,
  };
}
