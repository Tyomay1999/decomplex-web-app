"use client";

import { useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";

import type { VacancyEntityDto, VacancyJobType, VacancyStatus } from "@/features/vacancies/types";
import { useVacanciesInfinite } from "@/features/vacancies/hooks";

type UiVacancy = {
  id: string;
  title: string;
  companyId: string;
  location: string;
  postedLabel: string;
};

function formatPostedLabel(createdAtIso: string, t: ReturnType<typeof useTranslations>): string {
  const createdAt = new Date(createdAtIso).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, now - createdAt);

  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes < 60) return t("posted.minutesAgo", { count: minutes });

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("posted.hoursAgo", { count: hours });

  const days = Math.floor(hours / 24);
  return t("posted.daysAgo", { count: days });
}

type Params = {
  status: VacancyStatus;
  limit: number;
  jobType?: VacancyJobType;
  q?: string;
};

export function useHomeVacancies(params: Params) {
  const t = useTranslations("home");

  const { items, isFetching, isError, isInitialLoading, isEndReached, loadMore, reload } =
    useVacanciesInfinite(params);

  const uiVacancies: UiVacancy[] = useMemo(() => {
    return (items ?? []).map((v: VacancyEntityDto) => ({
      id: v.id,
      title: v.title,
      companyId: v.companyId,
      location: v.location ?? t("unknownLocation"),
      postedLabel: formatPostedLabel(v.createdAt, t),
    }));
  }, [items, t]);

  const countLabel = useMemo(
    () => t("count", { count: uiVacancies.length }),
    [t, uiVacancies.length],
  );

  const onSearchClick = useCallback(() => {
    reload();
  }, [reload]);

  return {
    uiVacancies,
    countLabel,
    isFetching,
    isError,
    isInitialLoading,
    isEndReached,
    loadMore,
    reload,
    onSearchClick,
  };
}
