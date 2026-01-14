"use client";

import { useTranslations } from "next-intl";

import { VacanciesGrid } from "./VacanciesGrid";
import { VacanciesSentinel } from "./VacanciesSentinel";
import { VacancyCard, VacanciesEmptyState } from "../components";
import { VacancyCardSkeleton } from "./VacancyCardSkeleton";
import { VacanciesLoadErrorCard } from "../components/VacanciesLoadErrorCard";

const SKELETON_COUNT = 8;

type UiVacancy = {
  id: string;
  title: string;
  companyId: string;
  location: string;
  postedLabel: string;
};

type Props = {
  title: string;
  countLabel: string;
  items: UiVacancy[];
  isInitialLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  isEndReached: boolean;
  onLoadMore: () => void;
  onVacancyClick: (id: string) => void;
};

export function VacanciesSection({
  title,
  countLabel,
  items,
  isInitialLoading,
  isError,
  isFetching,
  isEndReached,
  onLoadMore,
  onVacancyClick,
}: Props) {
  const t = useTranslations("home");

  return (
    <section className="vacancies-section">
      <div className="section-header">
        <h2 className="section-title text-primary">{title}</h2>
        <span className="vacancy-count text-secondary">{countLabel}</span>
      </div>

      {isInitialLoading ? (
        <div className="vacancies-grid" aria-busy="true" aria-label="Loading vacancies">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <VacancyCardSkeleton key={`sk-${i}`} />
          ))}
        </div>
      ) : isError ? (
        <VacanciesLoadErrorCard />
      ) : items.length > 0 ? (
        <>
          <VacanciesGrid>
            {items.map((v) => (
              <VacancyCard key={v.id} vacancy={v} onClick={() => onVacancyClick(v.id)} />
            ))}
          </VacanciesGrid>

          <VacanciesSentinel disabled={isFetching || isEndReached} onReach={onLoadMore} />

          {isFetching ? (
            <div
              className="vacancies-grid"
              aria-busy="true"
              style={{ marginTop: "20px" }}
              aria-label="Loading vacancies"
            >
              {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <VacancyCardSkeleton key={`sk-${i}`} />
              ))}
            </div>
          ) : null}

          {isEndReached ? (
            <div className="end-reached" role="status" aria-live="polite">
              <span className="end-reached__line" />
              <span className="end-reached__pill bg-surface border-color text-secondary">
                {t("endReached")}
              </span>
              <span className="end-reached__line" />
            </div>
          ) : null}
        </>
      ) : (
        <VacanciesEmptyState />
      )}
    </section>
  );
}
