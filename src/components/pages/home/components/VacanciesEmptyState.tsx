"use client";

import { useTranslations } from "next-intl";

export function VacanciesEmptyState() {
  const t = useTranslations("home");

  return (
    <div className="empty-state">
      <div className="empty-icon">💼</div>
      <div className="empty-text text-secondary">{t("emptyTitle")}</div>
    </div>
  );
}
