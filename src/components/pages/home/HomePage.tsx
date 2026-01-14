"use client";

import { useMemo, useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";

import { getAccessTokenFromCookie } from "@/lib/authCookies";
import { useAppSelector } from "@/store/hooks";

import { useDebouncedValue } from "./hooks/useDebouncedValue";
import { useHomeVacancies } from "./hooks/useHomeVacancies";
import { HomeHero } from "./ui/HomeHero";
import { VacanciesSection } from "./ui/VacanciesSection";

type LocaleParams = { locale?: string };

export function HomePage() {
  const t = useTranslations("home");
  const router = useRouter();
  const params = useParams<LocaleParams>();

  const locale = useMemo(
    () => (typeof params?.locale === "string" ? params.locale : "en"),
    [params?.locale],
  );

  const authState = useAppSelector((s) => s.auth);
  const isAuthed = Boolean(authState.accessToken || getAccessTokenFromCookie());

  const [query, setQuery] = useState("");
  const debouncedQ = useDebouncedValue(query.trim(), 400);

  const listParams = useMemo(() => {
    const base = { status: "active" as const, limit: 20 };
    if (debouncedQ) return { ...base, q: debouncedQ };
    return base;
  }, [debouncedQ]);

  const h = useHomeVacancies(listParams);

  const onVacancyClick = useCallback(
    (id: string) => {
      const detailUrl = `/${locale}/vacancies/${id}`;

      if (!isAuthed) {
        router.push(`/${locale}/login?redirect=${encodeURIComponent(detailUrl)}`);
        return;
      }

      router.push(detailUrl);
    },
    [isAuthed, locale, router],
  );

  return (
    <div className="page-content active">
      <HomeHero query={query} onQueryChange={setQuery} onSearchClick={h.onSearchClick} />

      <VacanciesSection
        title={t("sectionTitle")}
        countLabel={h.countLabel}
        items={h.uiVacancies}
        isInitialLoading={h.isInitialLoading}
        isError={h.isError}
        isFetching={h.isFetching}
        isEndReached={h.isEndReached}
        onLoadMore={h.loadMore}
        onVacancyClick={onVacancyClick}
      />
    </div>
  );
}
