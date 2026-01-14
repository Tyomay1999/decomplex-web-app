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
  const [trigger, query] = useLazyGetVacanciesQuery();

  const [items, setItems] = useState<VacancyEntityDto[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const stampRef = useRef(0);

  const paramsKey = useMemo(() => JSON.stringify(params), [params]);

  const loadFirst = useCallback(async () => {
    const stamp = ++stampRef.current;

    setIsInitialLoading(true);
    setItems([]);
    setNextCursor(null);

    try {
      const res = await trigger({ ...params, cursor: null }, true).unwrap();
      if (stampRef.current !== stamp) return;

      setItems(res.vacancies ?? []);
      setNextCursor(res.nextCursor ?? null);
    } finally {
      if (stampRef.current === stamp) setIsInitialLoading(false);
    }
  }, [trigger, params]);

  const loadMore = useCallback(async () => {
    if (query.isFetching) return;
    if (!nextCursor) return;

    const stamp = stampRef.current;

    const res = await trigger({ ...params, cursor: nextCursor }, true).unwrap();
    if (stampRef.current !== stamp) return;

    setItems((prev) => uniqById([...prev, ...(res.vacancies ?? [])]));
    setNextCursor(res.nextCursor ?? null);
  }, [query.isFetching, nextCursor, trigger, params]);

  useEffect(() => {
    loadFirst();
  }, [paramsKey, loadFirst]);

  const isEndReached = !isInitialLoading && !query.isFetching && nextCursor === null;

  return {
    items,
    nextCursor,
    isFetching: query.isFetching,
    isError: query.isError,
    isInitialLoading,
    isEndReached,
    loadMore,
    reload: loadFirst,
  };
}
