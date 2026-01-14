import { useEffect, useMemo, useState } from "react";
import { useLazyGetVacancyByIdQuery } from "@/features/vacancies";
import type { ApplicationEntityDto } from "@/features/applications/types";
import type { VacancyEntityDto } from "@/features/vacancies/types";
import type { VacancyMeta } from "../types";

function getTitle(v: VacancyEntityDto): string {
  return v.title?.trim() ?? "";
}

function getCompanyName(v: VacancyEntityDto): string {
  return v.companyId?.trim() ?? "";
}

function getLocation(v: VacancyEntityDto): string {
  return v.location?.trim() ?? "";
}

function getJobType(v: VacancyEntityDto): string {
  return v.jobType?.trim() ?? "";
}

export function useVacancyMetaMap(applications: ApplicationEntityDto[]) {
  const [fetchVacancy] = useLazyGetVacancyByIdQuery();
  const [metaByVacancyId, setMetaByVacancyId] = useState<Record<string, VacancyMeta>>({});

  const vacancyIds = useMemo(() => {
    const s = new Set<string>();
    for (const a of applications) {
      if (a.vacancyId) s.add(a.vacancyId);
    }
    return Array.from(s);
  }, [applications]);

  useEffect(() => {
    let cancelled = false;

    const missing = vacancyIds.filter((id) => !metaByVacancyId[id]);
    if (missing.length === 0) return;

    (async () => {
      for (const id of missing) {
        const res = await fetchVacancy(id, true);
        if (cancelled) return;

        if (!("data" in res)) continue;
        const v = res.data;
        if (!v) continue;

        const meta: VacancyMeta = {
          title: getTitle(v),
          companyName: getCompanyName(v),
          location: getLocation(v),
          jobType: getJobType(v),
        };

        setMetaByVacancyId((prev) => (prev[id] ? prev : { ...prev, [id]: meta }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [vacancyIds, fetchVacancy, metaByVacancyId]);

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

  return { metaByVacancyId, locationOptions, jobTypeOptions };
}
