"use client";

import { useTranslations } from "next-intl";

type Props = {
  onReload?: () => void;
  className?: string;
};

export function VacanciesLoadErrorCard({ onReload, className }: Props) {
  const t = useTranslations("home");

  const handleReload = () => {
    if (onReload) return onReload();
    window.location.reload();
  };

  return (
    <div className={`home-load-error-card bg-surface border-color ${className ?? ""}`}>
      <div className="home-load-error-card__inner">
        <div className="home-load-error-card__icon">
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

        <div className="home-load-error-card__content">
          <div className="home-load-error-card__title text-primary">{t("loadErrorTitle")}</div>
          <div className="home-load-error-card__body text-muted">{t("loadErrorBody")}</div>

          <div className="home-load-error-card__actions">
            <button type="button" onClick={handleReload} className="btn btn-primary">
              {t("reload")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
