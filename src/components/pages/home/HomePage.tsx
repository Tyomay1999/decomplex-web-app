"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";

import type { VacancyEntityDto, ListVacanciesQueryDto } from "@/features/vacancies/types";
import { useLazyGetVacanciesQuery } from "@/features/vacancies/vacanciesApi";
import { getAccessTokenFromCookie } from "@/lib/authCookies";
import { useAppSelector } from "@/store/hooks";

import { VacancyCard } from "./components/VacancyCard";
import { VacanciesEmptyState } from "./components/VacanciesEmptyState";

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

type UiVacancy = {
  id: string;
  title: string;
  companyId: string;
  location: string;
  postedLabel: string;
};

function useDebouncedValue<T>(value: T, delay = 400): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setV(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return v;
}

type VacanciesPageData = {
  vacancies: VacancyEntityDto[];
  nextCursor: string | null;
};

function toVacanciesPageData(input: unknown): VacanciesPageData {
  const obj = input as Record<string, unknown> | null;

  const vacancies = Array.isArray(obj?.vacancies) ? (obj?.vacancies as VacancyEntityDto[]) : [];
  const nextCursor =
    typeof obj?.nextCursor === "string"
      ? (obj?.nextCursor as string)
      : obj?.nextCursor === null
        ? null
        : null;

  return { vacancies, nextCursor };
}

export function HomePage() {
  const t = useTranslations("home");
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const locale = (params?.locale ?? "en") as string;

  const authState = useAppSelector((s) => s.auth);
  const isAuthed = Boolean(authState.accessToken || getAccessTokenFromCookie());

  const [query, setQuery] = useState("");
  const debouncedQ = useDebouncedValue(query.trim(), 400);

  const [items, setItems] = useState<VacancyEntityDto[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isEndReached, setIsEndReached] = useState(false);

  const [triggerGetVacancies] = useLazyGetVacanciesQuery();

  const buildParams = (cursor?: string | null): ListVacanciesQueryDto => {
    const base: Partial<ListVacanciesQueryDto> = {
      status: "active",
      limit: 20,
    };

    if (debouncedQ) {
      (base as { q?: string }).q = debouncedQ;
    }

    if (cursor) {
      (base as { cursor?: string }).cursor = cursor;
    }

    return base as ListVacanciesQueryDto;
  };

  const loadFirstPage = async () => {
    setIsInitialLoading(true);
    setIsFetching(true);
    setIsError(false);
    setIsEndReached(false);

    const res = await triggerGetVacancies(buildParams(null), true);
    const data = toVacanciesPageData(res.data);

    if ("error" in res && res.error) {
      setIsError(true);
      setItems([]);
      setNextCursor(null);
      setIsEndReached(true);
    } else {
      setItems(data.vacancies);
      setNextCursor(data.nextCursor);
      setIsEndReached(!data.nextCursor || data.vacancies.length === 0);
    }

    setIsFetching(false);
    setIsInitialLoading(false);
  };

  const loadMore = async () => {
    if (isFetching) return;
    if (isEndReached) return;

    setIsFetching(true);
    setIsError(false);

    const res = await triggerGetVacancies(buildParams(nextCursor), true);
    const data = toVacanciesPageData(res.data);

    if ("error" in res && res.error) {
      setIsError(true);
      setIsEndReached(true);
      setIsFetching(false);
      return;
    }

    setItems((prev) => {
      const seen = new Set(prev.map((v) => v.id));
      const merged = [...prev];
      for (const v of data.vacancies) {
        if (!seen.has(v.id)) merged.push(v);
      }
      return merged;
    });

    setNextCursor(data.nextCursor);
    setIsEndReached(!data.nextCursor || data.vacancies.length === 0);
    setIsFetching(false);
  };

  useEffect(() => {
    void loadFirstPage();
  }, [debouncedQ, locale]);

  const uiData: UiVacancy[] = useMemo(() => {
    return items.map((v) => ({
      id: v.id,
      title: v.title,
      companyId: v.companyId,
      location: v.location ?? t("unknownLocation"),
      postedLabel: formatPostedLabel(v.createdAt, t),
    }));
  }, [items, t]);

  const countLabel = t("count", { count: uiData.length });

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first?.isIntersecting) return;
        void loadMore();
      },
      { root: null, rootMargin: "200px", threshold: 0.01 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [sentinelRef, isEndReached, isFetching, nextCursor]);

  const onVacancyClick = (id: string) => {
    const detailUrl = `/${locale}/vacancies/${id}`;

    if (!isAuthed) {
      router.push(`/${locale}/login?redirect=${encodeURIComponent(detailUrl)}`);
      return;
    }

    router.push(detailUrl);
  };

  return (
    <div className="page-content active">
      <section className="hero">
        <h1 className="hero-title text-primary">{t("heroTitle")}</h1>
        <p className="hero-subtitle text-secondary">{t("heroSubtitle")}</p>

        <div className="search-container">
          <div className="search-bar bg-surface border-color">
            <input
              className="search-input text-primary"
              placeholder={t("searchPlaceholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <button
              className="search-btn"
              type="button"
              style={{ backgroundColor: "#3B82F6", color: "#FFFFFF" }}
            >
              {t("searchButton")}
            </button>
          </div>
        </div>
      </section>

      <section className="vacancies-section">
        <div className="section-header">
          <h2 className="section-title text-primary">{t("sectionTitle")}</h2>
          <span className="vacancy-count text-secondary">{countLabel}</span>
        </div>

        {isInitialLoading ? (
          <div className="text-secondary">{t("loading")}</div>
        ) : isError ? (
          <div className="text-secondary">{t("loadError")}</div>
        ) : uiData.length > 0 ? (
          <>
            <div className="vacancies-grid">
              {uiData.map((v) => (
                <VacancyCard key={v.id} vacancy={v} onClick={() => onVacancyClick(v.id)} />
              ))}
            </div>

            <div ref={sentinelRef} style={{ height: 1 }} />

            {isFetching ? <div className="text-secondary">{t("loading")}</div> : null}
            {isEndReached ? (
              <div className="text-secondary" style={{ paddingTop: 10 }}>
                {t("endReached")}
              </div>
            ) : null}
          </>
        ) : (
          <VacanciesEmptyState />
        )}
      </section>
    </div>
  );
}
