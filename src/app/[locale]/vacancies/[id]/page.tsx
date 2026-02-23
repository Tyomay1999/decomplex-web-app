import { locales } from "@/i18n/config";
import { env } from "@/config/env";
import type { ListVacanciesResponseDto } from "@/features/vacancies/types";
import { VacancyDetailsPage } from "@/components/pages/vacancy-details";

export const dynamicParams = true;

export async function generateStaticParams(): Promise<Array<{ locale: string; id: string }>> {
  const baseUrl = (env.apiBaseUrl ?? "").replace(/\/$/, "");
  const limit = 200;

  try {
    const res = await fetch(`${baseUrl}/vacancies?status=active&limit=${limit}`, {
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) return [];

    const json = (await res.json()) as ListVacanciesResponseDto;
    const vacancies = json?.data?.vacancies ?? [];

    const ids = vacancies.map((v) => String(v.id)).filter((v) => v.length > 0);

    return locales.flatMap((locale) => ids.map((id) => ({ locale, id })));
  } catch {
    return [];
  }
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function VacancyPage({ params }: PageProps) {
  const { id } = await params;
  return <VacancyDetailsPage id={id} />;
}
