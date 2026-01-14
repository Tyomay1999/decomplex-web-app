"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { useGetVacancyByIdQuery } from "@/features/vacancies";
import type { VacancyEntityDto } from "@/features/vacancies/types";
import { ApplyModal } from "@/features/applications/ui/ApplyModal";

import {
  VacancyDetailsShell,
  VacancyDetailsHeader,
  VacancyDetailsBody,
  VacancyDetailsFooter,
} from "./ui";
import { useBodyScrollLock, useVacancyApply } from "./hooks";
import { VacancyDetailsSkeleton } from "./ui/VacancyDetailsSkeleton";
import { VacancyDetailsError } from "./ui/VacancyDetailsError";

type Props = { id: string };

type LocaleParams = { locale?: string };

export function VacancyDetailsPage({ id }: Props) {
  const t = useTranslations("vacancy");
  const router = useRouter();
  const params = useParams<LocaleParams>();

  const locale = useMemo(
    () => (typeof params?.locale === "string" ? params.locale : "en"),
    [params?.locale],
  );

  const { data: vacancy, isLoading, isError } = useGetVacancyByIdQuery(id);

  const [isApplyOpen, setIsApplyOpen] = useState(false);
  useBodyScrollLock(isApplyOpen);

  const v = vacancy as VacancyEntityDto | undefined;

  const meta = useMemo(() => {
    if (!v) return "";
    const location = v.location ? v.location : t("unknownLocation");
    const parts = [location, v.jobType, v.status].filter((x) => Boolean(x));
    return parts.join(" • ");
  }, [v, t]);

  const apply = useVacancyApply({ vacancyId: id, locale });

  const onClose = () => router.back();

  if (isLoading) {
    return (
      <div className="page-content active vacancy-details">
        <section className="vacancies-section vacancy-details__section">
          <VacancyDetailsSkeleton />
        </section>
      </div>
    );
  }

  if (isError || !v) {
    return (
      <div className="page-content active vacancy-details">
        <section className="vacancies-section vacancy-details__section">
          <VacancyDetailsError onBack={onClose} onRetry={() => window.location.reload()} />
        </section>
      </div>
    );
  }

  return (
    <div className="page-content active vacancy-details">
      <section className="vacancies-section vacancies-details-section-container vacancy-details__section">
        <VacancyDetailsShell>
          <VacancyDetailsHeader
            title={v.title}
            meta={meta}
            onBack={onClose}
            backLabel={t("back")}
          />
          <VacancyDetailsBody
            descriptionLabel={t("description")}
            detailsLabel={t("details")}
            vacancy={v}
          />
          <VacancyDetailsFooter
            onClose={onClose}
            closeLabel={t("close")}
            applyLabel={t("apply")}
            applyDisabled={v.hasApplied || false}
            applyTitle={apply.applyTitle}
            onApply={() => {
              const ok = apply.openApply();
              if (ok) setIsApplyOpen(true);
            }}
          />
        </VacancyDetailsShell>
      </section>

      <ApplyModal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        vacancyId={id}
        vacancyTitle={v.title}
      />
    </div>
  );
}
