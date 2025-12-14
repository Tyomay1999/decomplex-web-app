import Link from "next/link";
import type { Locale } from "../../../../i18n/config";
import { fetchVacanciesList } from "../../../../features/vacancies/server";

export const dynamic = "force-static";
export const revalidate = 60;

export default async function VacanciesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams?: Promise<{ q?: string; page?: string }>;
}) {
  const { locale } = await params;
  const sp = (await searchParams) || {};

  const page = sp.page ? Number(sp.page) : 1;
  const q = sp.q || "";

  const items = await fetchVacanciesList(locale, { page, limit: 20, q });

  return (
    <main style={{ padding: 24 }}>
      <h1>Vacancies</h1>

      {items.length === 0 ? (
        <p>No vacancies found.</p>
      ) : (
        <ul>
          {items.map((v) => {
            const href = `/${locale}/vacancies/${v.slug || v.id}`;
            return (
              <li key={v.id}>
                <Link href={href}>{v.title}</Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
