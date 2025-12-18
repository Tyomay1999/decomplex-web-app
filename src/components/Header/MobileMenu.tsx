"use client";

import { Link } from "../../i18n/navigation";
import { useEffect } from "react";
import type { Lang } from "./types";
import { useTranslations } from "next-intl";
import { LANGS } from "./types";

type Props = {
  isOpen: boolean;
  onNavigate?: () => void;
  isAuthenticated?: boolean;
  userEmail?: string | null;
  showProfileLink?: boolean;

  lang: Lang;
  theme: "light" | "dark";
  onLangChange: (lang: Lang) => void;
  onToggleTheme: () => void;

  hideLogin?: boolean;
  hideRegister?: boolean;
  onLogout?: () => void;
};

export function MobileMenu({
  isOpen,
  onNavigate,
  isAuthenticated = false,
  userEmail = null,
  showProfileLink = false,
  lang,
  theme,
  onLangChange,
  onToggleTheme,
  hideLogin = false,
  hideRegister = false,
  onLogout,
}: Props) {
  const t = useTranslations("header");

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const clickedInsideMenu = !!target.closest("[data-mobile-menu]");
      const clickedBurger = !!target.closest("[data-burger]");

      if (!clickedInsideMenu && !clickedBurger) {
        onNavigate?.();
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onNavigate?.();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onNavigate]);

  if (!isOpen) return null;

  const close = () => onNavigate?.();

  return (
    <nav className="mobile-menu bg-surface border-color" data-mobile-menu>
      <div className="mobile-controls">
        <div className="mobile-lang">
          {LANGS.map((l) => (
            <button
              key={l}
              type="button"
              className={`mobile-lang-btn ${l === lang ? "active" : ""}`}
              onClick={() => {
                onLangChange(l);
                close();
              }}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        <button type="button" className="mobile-theme-btn" onClick={onToggleTheme}>
          {theme === "light" ? `🌙 ${t("theme.dark")}` : `☀️ ${t("theme.light")}`}
        </button>
      </div>

      <div className="divider" style={{ height: 1, margin: "12px 0" }} />

      <Link className="mobile-nav-link" href="/" onClick={close}>
        {t("home")}
      </Link>

      {showProfileLink && (
        <Link className="mobile-nav-link" href="/profile" onClick={close}>
          {t("profile")}
        </Link>
      )}

      <div className="divider" style={{ height: 1, margin: "12px 0" }} />

      {!isAuthenticated ? (
        <>
          {!hideLogin && (
            <Link className="mobile-nav-link" href="/login" onClick={close}>
              {t("login")}
            </Link>
          )}
          {!hideRegister && (
            <Link className="mobile-nav-link" href="/register" onClick={close}>
              {t("signup")}
            </Link>
          )}
        </>
      ) : (
        <>
          {userEmail && (
            <div className="text-secondary" style={{ padding: "12px 16px" }}>
              {userEmail}
            </div>
          )}
          <button
            type="button"
            className="mobile-nav-link"
            onClick={() => {
              onLogout?.();
              close();
            }}
          >
            {t("logout")}
          </button>
        </>
      )}
    </nav>
  );
}
