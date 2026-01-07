"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import type { ApplicationEntityDto } from "@/features/applications/types";
import { useLazyGetVacancyByIdQuery } from "@/features/vacancies/vacanciesApi";
import { ApplicationsFilters } from "./ApplicationsFilters";

type Props = {
  title: string;
  emptyText: string;

  applications: ApplicationEntityDto[];

  isLoading: boolean;
  isError: boolean;

  hasMore: boolean;
  isFetchingMore: boolean;
  onLoadMore: () => void;
  onRetry: () => void;

  labels: {
    searchPlaceholder: string;
    loadMore: string;
    loading: string;
    retry: string;

    filterAll: string;
    filterReset: string;
    filterLocation: string;
    filterJobType: string;
  };

  statusLabels: Record<string, string>;
  appliedLabel: (dateStr: string) => string;
};

type VacancyMeta = {
  title: string;
  companyName: string;
  location: string;
  jobType: string;
};

type VacancyLike = {
  title?: string;
  name?: string;
  location?: string;
  city?: string;
  country?: string;
  jobType?: string;
  employmentType?: string;
  companyName?: string;
  company?: {
    name?: string;
  };
};

function norm(s: string): string {
  return s.trim().toLowerCase();
}

function getVacancyTitle(v: VacancyLike): string {
  return v.title?.trim() || v.name?.trim() || "";
}

function getCompanyName(v: VacancyLike): string {
  return v.company?.name?.trim() || v.companyName?.trim() || "";
}

function getLocation(v: VacancyLike): string {
  return v.location?.trim() || v.city?.trim() || v.country?.trim() || "";
}

function getJobType(v: VacancyLike): string {
  return v.jobType?.trim() || v.employmentType?.trim() || "";
}

function StatusPill({
  status,
  statusLabels,
}: {
  status: string;
  statusLabels: Record<string, string>;
}) {
  const label = statusLabels[status] ?? statusLabels.unknown ?? status;
  return <span className={`application-status status-${status}`}>{label}</span>;
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
}: Props) {
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? "en";

  const [fetchVacancy] = useLazyGetVacancyByIdQuery();

  const [metaByVacancyId, setMetaByVacancyId] = useState<Record<string, VacancyMeta>>({});

  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");

  useEffect(() => {
    let cancelled = false;

    const ids = Array.from(new Set(applications.map((a) => a.vacancyId))).filter(Boolean);
    const missing = ids.filter((id) => !metaByVacancyId[id]);
    if (missing.length === 0) return;

    (async () => {
      for (const id of missing) {
        const res = await fetchVacancy(id, true);
        if (cancelled) return;

        const data = "data" in res ? (res.data as VacancyLike | undefined) : undefined;
        if (!data) continue;

        const meta: VacancyMeta = {
          title: getVacancyTitle(data),
          companyName: getCompanyName(data),
          location: getLocation(data),
          jobType: getJobType(data),
        };

        setMetaByVacancyId((prev) => (prev[id] ? prev : { ...prev, [id]: meta }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [applications, fetchVacancy, metaByVacancyId]);

  const locationOptions = useMemo(() => {
    const s = new Set<string>();
    Object.values(metaByVacancyId).forEach((m) => {
      const v = m.location.trim();
      if (v) s.add(v);
    });

    return Array.from(s)
      .sort((a, b) => a.localeCompare(b))
      .map((v) => ({ value: v, label: v }));
  }, [metaByVacancyId]);

  const jobTypeOptions = useMemo(() => {
    const s = new Set<string>();
    Object.values(metaByVacancyId).forEach((m) => {
      const v = m.jobType.trim();
      if (v) s.add(v);
    });

    return Array.from(s)
      .sort((a, b) => a.localeCompare(b))
      .map((v) => ({ value: v, label: v }));
  }, [metaByVacancyId]);

  const filtered = useMemo(() => {
    const qq = norm(q);
    const loc = norm(location);
    const jt = norm(jobType);

    return applications.filter((app) => {
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
          <div className="empty-state">
            <div className="empty-text text-secondary">{labels.loading}</div>
          </div>
        ) : isError ? (
          <div className="empty-state">
            <div className="empty-text text-secondary">
              <button className="btn-link text-primary" onClick={onRetry} type="button">
                {labels.retry}
              </button>
            </div>
          </div>
        ) : hasApps ? (
          <>
            <div className="applications-list">
              {filtered.map((app) => {
                const meta = metaByVacancyId[app.vacancyId];
                const vacancyTitle = meta?.title || app.vacancyId;
                const companyName = meta?.companyName || "";
                const loc = meta?.location || "";
                const jt = meta?.jobType || "";

                const date = new Date(app.createdAt);
                const dateStr = date.toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });

                return (
                  <Link
                    key={app.id}
                    href={`/${locale}/vacancies/${app.vacancyId}`}
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
              <div className="profile-actions">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={onLoadMore}
                  disabled={isFetchingMore}
                >
                  {labels.loadMore}
                </button>
              </div>
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
