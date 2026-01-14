"use client";

import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";

import type { ApplicationEntityDto } from "@/features/applications/types";
import { ApplicationsFilters } from "./ApplicationsFilters";
import { StatusPill } from "./StatusPill";
import { useVacancyMetaMap } from "../hooks/index";
import type { ProfileApplicationsCardProps } from "../types";
import { ProfileApplicationsSkeleton } from "./ProfileApplicationsSkeleton";
import { ProfileApplicationsErrorCard } from "./ProfileApplicationsErrorCard";

function norm(s: string): string {
  return s.trim().toLowerCase();
}

function formatAppliedDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function ProfileApplicationsCard({
  title,
  emptyText,
  applications,
  isLoading,
  isError,
  hasMore,
  isFetchingMore,
  onLoadMore,
  onRetry,
  labels,
  statusLabels,
  appliedLabel,
}: ProfileApplicationsCardProps) {
  const { metaByVacancyId, locationOptions, jobTypeOptions } = useVacancyMetaMap(applications);

  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");

  const filtered = useMemo(() => {
    const qq = norm(q);
    const loc = norm(location);
    const jt = norm(jobType);

    return applications.filter((app: ApplicationEntityDto) => {
      const meta = metaByVacancyId[app.vacancyId];

      if (loc && norm(meta?.location ?? "") !== loc) return false;
      if (jt && norm(meta?.jobType ?? "") !== jt) return false;

      if (!qq) return true;

      const titleText = norm(meta?.title ?? "");
      const companyText = norm(meta?.companyName ?? "");
      const locText = norm(meta?.location ?? "");
      const jobText = norm(meta?.jobType ?? "");
      const statusText = norm(String(app.status ?? ""));

      return (
        titleText.includes(qq) ||
        companyText.includes(qq) ||
        locText.includes(qq) ||
        jobText.includes(qq) ||
        statusText.includes(qq)
      );
    });
  }, [applications, metaByVacancyId, q, location, jobType]);

  const onReset = () => {
    setQ("");
    setLocation("");
    setJobType("");
  };

  const hasApps = filtered.length > 0;

  return (
    <div className="profile-card bg-surface border-color">
      <div className="profile-section">
        <h2 className="profile-section-title text-primary">{title}</h2>

        <ApplicationsFilters
          q={q}
          onQ={setQ}
          location={location}
          onLocation={setLocation}
          jobType={jobType}
          onJobType={setJobType}
          locations={locationOptions}
          jobTypes={jobTypeOptions}
          labels={{
            searchPlaceholder: labels.searchPlaceholder,
            location: labels.filterLocation,
            jobType: labels.filterJobType,
            all: labels.filterAll,
            reset: labels.filterReset,
          }}
          onReset={onReset}
        />

        {isLoading ? (
          <ProfileApplicationsSkeleton />
        ) : isError ? (
          <ProfileApplicationsErrorCard
            title={labels.loadErrorTitle}
            body={labels.loadErrorBody}
            retryLabel={labels.retry}
            onRetry={onRetry}
          />
        ) : hasApps ? (
          <>
            <div className="applications-list">
              {filtered.map((app) => {
                const meta = metaByVacancyId[app.vacancyId];
                const vacancyTitle = meta?.title || app.vacancyId;
                const companyName = meta?.companyName || "";
                const loc = meta?.location || "";
                const jt = meta?.jobType || "";

                const dateStr = formatAppliedDate(app.createdAt);

                return (
                  <Link
                    key={app.id}
                    href={`/vacancies/${app.vacancyId}`}
                    className="application-item border-color"
                  >
                    <div className="application-title text-primary">{vacancyTitle}</div>

                    {companyName ? (
                      <div className="application-company text-secondary">{companyName}</div>
                    ) : null}

                    {loc || jt ? (
                      <div className="application-meta text-tertiary">
                        {loc ? <span className="application-meta__item">{loc}</span> : null}
                        {jt ? <span className="application-meta__item">{jt}</span> : null}
                      </div>
                    ) : null}

                    <div className="application-date text-tertiary">{appliedLabel(dateStr)}</div>

                    <StatusPill status={String(app.status)} statusLabels={statusLabels} />
                  </Link>
                );
              })}
            </div>

            {hasMore ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={onLoadMore}
                disabled={isFetchingMore}
              >
                {isFetchingMore ? <span className="spinner" /> : null}
                <span style={{ marginLeft: isFetchingMore ? 8 : 0 }}>{labels.loadMore}</span>
              </button>
            ) : null}
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <div className="empty-text text-secondary">{emptyText}</div>
          </div>
        )}
      </div>
    </div>
  );
}
