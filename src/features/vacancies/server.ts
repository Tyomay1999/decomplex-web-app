import "server-only";
import { env } from "../../config/env";
import type { Locale } from "../../i18n/config";
import type { VacancyDetails, VacancyListItem } from "./types";

type VacanciesListParams = {
  page?: number;
  limit?: number;
  q?: string;
};

function buildQuery(params: Record<string, string | number | undefined>) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === "") return;
    sp.set(k, String(v));
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchVacanciesList(locale: Locale, params: VacanciesListParams = {}) {
  const url =
    `${env.apiBaseUrl}/public/vacancies` +
    buildQuery({ page: params.page, limit: params.limit, q: params.q });

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Accept-Language": locale,
    },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Vacancies list fetch failed: ${res.status}`);
  }

  const data = (await res.json()) as { items: VacancyListItem[] } | VacancyListItem[];
  return Array.isArray(data) ? data : data.items;
}

export async function fetchVacancyBySlug(locale: Locale, slug: string) {
  const url = `${env.apiBaseUrl}/public/vacancies/${encodeURIComponent(slug)}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Accept-Language": locale,
    },
    next: { revalidate: 60 },
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Vacancy fetch failed: ${res.status}`);

  return (await res.json()) as VacancyDetails;
}
