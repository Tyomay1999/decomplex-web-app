"use client";

import { useTranslations } from "next-intl";

type Props = {
  onBack: () => void;
  onRetry?: () => void;
};

export function VacancyDetailsError({ onBack, onRetry }: Props) {
  const t = useTranslations("vacancy");

  return (
    <div className="vacancy-details__container">
      <div className="vacancy-details-error bg-surface border-color">
        <div className="vde__icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 9v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path
              d="M10.3 4.3 2.6 18a2 2 0 0 0 1.8 3h15.2a2 2 0 0 0 1.8-3L13.7 4.3a2 2 0 0 0-3.4 0Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="vde__content">
          <div className="vde__title text-primary">{t("loadErrorTitle")}</div>
          <div className="vde__body text-muted">{t("loadErrorBody")}</div>

          <div className="vde__actions">
            <button type="button" className="btn btn-outline" onClick={onBack}>
              {t("back")}
            </button>

            {onRetry ? (
              <button type="button" className="btn btn-primary" onClick={onRetry}>
                {t("retry")}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
