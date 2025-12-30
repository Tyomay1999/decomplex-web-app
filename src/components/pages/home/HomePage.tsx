"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import type { VacancyEntityDto } from "@/features/vacancies/types";
import { getPublicVacancies } from "@/features/vacancies/server";
import { VacancyCard } from "./components/VacancyCard";
import { VacanciesEmptyState } from "./components/VacanciesEmptyState";

function formatPostedLabel(createdAtIso: string, t: ReturnType<typeof useTranslations>): string {
  const createdAt = new Date(createdAtIso).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, now - createdAt);

  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes < 60) {
    return t("posted.minutesAgo", { count: minutes });
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return t("posted.hoursAgo", { count: hours });
  }

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

export function HomePage() {
  const t = useTranslations("home");

  const [query, setQuery] = useState<string>("");
  const [, setSelected] = useState<UiVacancy | null>(null);

  const [data, setData] = useState<UiVacancy[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setIsLoading(true);
        setIsError(false);

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const vacancies = await getPublicVacancies(baseUrl, { status: "active" });

        const ui = vacancies.map((v: VacancyEntityDto) => ({
          id: v.id,
          title: v.title,
          companyId: v.companyId,
          location: v.location ?? t("unknownLocation"),
          postedLabel: formatPostedLabel(v.createdAt, t),
        }));

        if (alive) setData(ui);
      } catch {
        if (alive) setIsError(true);
      } finally {
        if (alive) setIsLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [t]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;

    return data.filter((v) => {
      const text = `${v.title} ${v.companyId} ${v.location}`.toLowerCase();
      return text.includes(q);
    });
  }, [query, data]);

  const countLabel = t("count", { count: filtered.length });

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

        {isLoading ? (
          <div className="text-secondary">{t("loading")}</div>
        ) : isError ? (
          <div className="text-secondary">{t("loadError")}</div>
        ) : filtered.length > 0 ? (
          <div className="vacancies-grid">
            {filtered.map((v) => (
              <VacancyCard key={v.id} vacancy={v} onClick={() => setSelected(v)} />
            ))}
          </div>
        ) : (
          <VacanciesEmptyState />
        )}
      </section>
    </div>
  );
}
