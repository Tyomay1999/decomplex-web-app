import type { ListVacanciesQueryDto, VacancyEntityDto } from "./types";

function toQueryString(query?: ListVacanciesQueryDto): string {
  if (!query) return "";
  const params = new URLSearchParams();

  if (query.companyId) params.set("companyId", query.companyId);
  if (query.status) params.set("status", query.status);
  if (query.jobType) params.set("jobType", query.jobType);

  const str = params.toString();
  return str ? `?${str}` : "";
}

type AnyResponse = any;

export async function getPublicVacancies(
    baseUrl: string | undefined,
    query?: ListVacanciesQueryDto,
): Promise<VacancyEntityDto[]> {
  // ВАЖНО: fallback на относительный URL, чтобы работало как на скрине: /vacancies?...
  const prefix = (baseUrl ?? "").replace(/\/$/, "");
  const url = `${prefix}/vacancies${toQueryString(query)}`;

  const res = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  const json: AnyResponse = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(
        `GET ${url} failed: ${res.status}. body=${JSON.stringify(json)}`,
    );
  }

  // Устойчивое извлечение массива вакансий:
  const vacancies =
      json?.data?.vacancies ??
      json?.data?.data?.vacancies ??
      json?.vacancies ??
      json?.data;

  if (!Array.isArray(vacancies)) {
    throw new Error(
        `Unexpected response shape for ${url}: ${JSON.stringify(json)}`,
    );
  }

  return vacancies as VacancyEntityDto[];
}
