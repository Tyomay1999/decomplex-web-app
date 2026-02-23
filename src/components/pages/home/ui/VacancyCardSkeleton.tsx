"use client";

export function VacancyCardSkeleton() {
  return (
    <div
      className="vacancy-card vacancy-card--skeleton bg-surface"
      data-testid="vacancy-card-skeleton"
      aria-hidden="true"
    >
      <div className="sk-line sk-title" />
      <div className="sk-line sk-subtitle" />
      <div className="sk-row">
        <div className="sk-chip" />
        <div className="sk-chip" />
      </div>
      <div className="sk-line sk-meta" />
    </div>
  );
}
