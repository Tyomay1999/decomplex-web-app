import { locales } from "@/i18n/config";
import { env } from "@/config/env";
import type { ListVacanciesResponseDto } from "@/features/vacancies/types";
import { VacancyDetailsClient } from "./VacancyDetailsClient";

export async function generateStaticParams() {
  const baseUrl = (env.apiBaseUrl ?? "").replace(/\/$/, "");

  const limit = 200;

  const res = await fetch(`${baseUrl}/vacancies?status=active&limit=${limit}`, {
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
  });

  const json = (await res.json()) as ListVacanciesResponseDto;

  const vacancies = json?.data?.vacancies ?? [];

  const ids = vacancies.map((v) => v.id);

  const params: Array<{ locale: string; id: string }> = [];
  for (const l of locales) {
    for (const id of ids) params.push({ locale: l, id });
  }

  return params;
}

type PageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function VacancyPage({ params }: PageProps) {
  const { id, locale } = await params;

  return <VacancyDetailsClient id={id} locale={locale} />;
}
