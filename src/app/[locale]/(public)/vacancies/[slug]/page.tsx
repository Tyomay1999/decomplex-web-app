import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Locale } from "../../../../../i18n/config";
import { fetchVacancyBySlug } from "../../../../../features/vacancies/server";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;

  const vacancy = await fetchVacancyBySlug(locale, slug);
  if (!vacancy) return { title: "Vacancy not found" };

  const title = vacancy.title || "Vacancy";
  const description = vacancy.description?.slice(0, 160) || "View vacancy details and apply.";

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/vacancies/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/${locale}/vacancies/${slug}`,
      type: "article",
    },
  };
}

export default async function VacancyDetailsPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;

  const vacancy = await fetchVacancyBySlug(locale, slug);
  if (!vacancy) notFound();

  return (
    <main style={{ padding: 24 }}>
      <h1>{vacancy.title}</h1>
      {vacancy.companyName && <p>Company: {vacancy.companyName}</p>}
      {vacancy.location && <p>Location: {vacancy.location}</p>}

      <section style={{ marginTop: 16 }}>
        <h2>Description</h2>
        <p>{vacancy.description || "—"}</p>
      </section>
    </main>
  );
}
