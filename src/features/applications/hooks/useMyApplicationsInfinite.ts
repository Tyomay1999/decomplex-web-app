"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLazyGetMyApplicationsQuery } from "../applicationsApi";
import type { ApplicationEntityDto } from "../types";

type Options = {
  limit?: number;
};

function uniqById(items: ApplicationEntityDto[]): ApplicationEntityDto[] {
  const map = new Map<string, ApplicationEntityDto>();
  for (const it of items) map.set(it.id, it);
  return Array.from(map.values());
}

export function useMyApplicationsInfinite(opts: Options = {}) {
  const limit = opts.limit ?? 20;

  const [cursor, setCursor] = useState<string | null>(null);
  const [items, setItems] = useState<ApplicationEntityDto[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const [trigger, query] = useLazyGetMyApplicationsQuery();
  const stampRef = useRef(0);

  const loadFirst = useCallback(async () => {
    const stamp = ++stampRef.current;

    setCursor(null);
    setItems([]);
    setHasMore(true);

    try {
      const res = await trigger({ limit, cursor: null }, true).unwrap();
      if (stampRef.current !== stamp) return;

      setItems(res.items ?? []);
      setCursor(res.nextCursor ?? null);
      setHasMore(Boolean(res.nextCursor));
    } catch {
      if (stampRef.current !== stamp) return;
      setHasMore(false);
    }
  }, [trigger, limit]);

  const loadMore = useCallback(async () => {
    if (!hasMore) return;
    if (query.isFetching) return;

    const stamp = stampRef.current;

    try {
      const res = await trigger({ limit, cursor }, true).unwrap();
      if (stampRef.current !== stamp) return;

      setItems((prev) => uniqById([...prev, ...(res.items ?? [])]));
      setCursor(res.nextCursor ?? null);
      setHasMore(Boolean(res.nextCursor));
    } catch {
      if (stampRef.current !== stamp) return;
      setHasMore(false);
    }
  }, [hasMore, query.isFetching, trigger, limit, cursor]);

  useEffect(() => {
    loadFirst();
  }, [loadFirst]);

  return {
    items,
    hasMore,
    isInitialLoading: query.isFetching && items.length === 0,
    isFetching: query.isFetching,
    isError: query.isError,
    reload: loadFirst,
    loadMore,
  };
}
