"use client";

import { useTranslations } from "next-intl";

type Props = {
  query: string;
  onQueryChange: (v: string) => void;
  onSearchClick: () => void;
};

export function HomeHero({ query, onQueryChange, onSearchClick }: Props) {
  const t = useTranslations("home");

  return (
    <section className="hero">
      <h1 className="hero-title text-primary">{t("heroTitle")}</h1>
      <p className="hero-subtitle text-secondary">{t("heroSubtitle")}</p>

      <div className="search-container">
        <div className="search-bar bg-surface border-color">
          <input
            className="search-input text-primary"
            placeholder={t("searchPlaceholder")}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
          />
          <button className="search-btn btn btn-primary" type="button" onClick={onSearchClick}>
            {t("searchButton")}
          </button>
        </div>
      </div>
    </section>
  );
}
