"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLazyGetMyApplicationsQuery } from "../applicationsApi";
import type { ApplicationEntityDto } from "../types";

type Options = {
  limit?: number;
};

export function useMyApplicationsInfinite(opts: Options = {}) {
  const limit = opts.limit ?? 20;

  const [cursor, setCursor] = useState<string | null>(null);
  const [items, setItems] = useState<ApplicationEntityDto[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const [trigger, query] = useLazyGetMyApplicationsQuery();

  const loadFirst = useCallback(async () => {
    setCursor(null);
    setItems([]);
    setHasMore(true);

    const res = await trigger({ limit, cursor: null }, true);
    if (!res.data) return;

    setItems(res.data.items);
    setCursor(res.data.nextCursor);
    setHasMore(Boolean(res.data.nextCursor));
  }, [trigger, limit]);

  const loadMore = useCallback(async () => {
    if (!hasMore || query.isFetching) return;

    const res = await trigger({ limit, cursor }, true);
    if (!res.data) return;

    setItems((prev) => {
      const seen = new Set(prev.map((x) => x.id));
      const next = res.data!.items.filter((x) => !seen.has(x.id));
      return [...prev, ...next];
    });

    setCursor(res.data.nextCursor);
    setHasMore(Boolean(res.data.nextCursor));
  }, [trigger, limit, cursor, hasMore, query.isFetching]);

  useEffect(() => {
    loadFirst();
  }, [loadFirst]);

  const state = useMemo(
    () => ({
      items,
      hasMore,
      isLoading: query.isLoading && items.length === 0,
      isFetching: query.isFetching,
      isError: query.isError,
      refetch: loadFirst,
      loadMore,
    }),
    [items, hasMore, query.isLoading, query.isFetching, query.isError, loadFirst, loadMore],
  );

  return state;
}
