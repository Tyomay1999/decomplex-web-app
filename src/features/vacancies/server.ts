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

type JsonObject = Record<string, unknown>;

function isRecord(v: unknown): v is JsonObject {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function getNested(obj: unknown, key: string): unknown {
  if (!isRecord(obj)) return undefined;
  return obj[key];
}

export async function getPublicVacancies(
  baseUrl: string | undefined,
  query?: ListVacanciesQueryDto,
): Promise<VacancyEntityDto[]> {
  const prefix = (baseUrl ?? "").replace(/\/$/, "");
  const url = `${prefix}/vacancies${toQueryString(query)}`;

  const res = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  const json: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(`GET ${url} failed: ${res.status}. body=${JSON.stringify(json)}`);
  }

  const data = getNested(json, "data");
  const dataVacancies = getNested(data, "vacancies");

  const dataData = getNested(data, "data");
  const dataDataVacancies = getNested(dataData, "vacancies");

  const topVacancies = getNested(json, "vacancies");

  const fallback = data;

  const candidates: unknown[] = [dataVacancies, dataDataVacancies, topVacancies, fallback];

  const vacancies = candidates.find(Array.isArray);

  if (!Array.isArray(vacancies)) {
    throw new Error(`Unexpected response shape for ${url}: ${JSON.stringify(json)}`);
  }

  return vacancies as VacancyEntityDto[];
}
