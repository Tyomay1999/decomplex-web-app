"use client";

import type { VacancyEntityDto } from "@/features/vacancies/types";
import { useTranslations } from "next-intl";
import { DescriptionRichText } from "./DescriptionRichText";

type Props = {
  descriptionLabel: string;
  detailsLabel: string;
  vacancy: VacancyEntityDto;
};

export function VacancyDetailsBody({ descriptionLabel, detailsLabel, vacancy }: Props) {
  const t = useTranslations("vacancy");

  const hasSalary = Boolean(vacancy.salaryFrom || vacancy.salaryTo);

  const salaryText = hasSalary
    ? t("salaryRange", {
        from: vacancy.salaryFrom ?? t("salaryUnknownValue"),
        to: vacancy.salaryTo ?? t("salaryUnknownValue"),
      })
    : t("salaryUnknown");

  return (
    <div className="modal-content">
      <div className="modal-section">
        <h3 className="modal-section-title text-tertiary">{descriptionLabel}</h3>
        <div className="modal-section-content text-primary">
          <DescriptionRichText text={vacancy.description} />
        </div>
      </div>

      <div className="modal-section">
        <h3 className="modal-section-title text-tertiary">{detailsLabel}</h3>
        <p className="modal-section-content text-primary">
          {t("salaryLine", { value: salaryText })}
        </p>
      </div>
    </div>
  );
}
