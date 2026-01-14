"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

import { LANGS } from "../types";
import type { Lang, UiTheme } from "../types";
import { ConfirmModal } from "@/components/shared/modal";

type Props = {
  isOpen: boolean;
  onNavigate?: () => void;

  isAuthenticated?: boolean;
  userEmail?: string | null;
  showProfileLink?: boolean;

  lang: Lang;
  theme: UiTheme;
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
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const clickedInsideMenu = !!target.closest("[data-mobile-menu]");
      const clickedBurger = !!target.closest("[data-burger]");

      if (!clickedInsideMenu && !clickedBurger) onNavigate?.();
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

  const close = () => onNavigate?.();

  const themeLabel = useMemo(() => {
    return theme === "light" ? t("theme.dark") : t("theme.light");
  }, [theme, t]);

  const askLogout = () => {
    close();
    setLogoutConfirmOpen(true);
  };

  const confirmLogout = () => {
    setLogoutConfirmOpen(false);
    onLogout?.();
  };

  if (!isOpen) {
    return (
      <ConfirmModal
        isOpen={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        onConfirm={confirmLogout}
        title={t("logoutConfirm.title")}
        description={t("logoutConfirm.description")}
        cancelLabel={t("logoutConfirm.cancel")}
        confirmLabel={t("logoutConfirm.confirm")}
      />
    );
  }

  return (
    <>
      <div className="mobile-menu-overlay" onClick={() => onNavigate?.()} aria-hidden="true" />
      <nav className="mobile-menu bg-surface border-color" data-mobile-menu>
        <div className="mobile-controls">
          <div className="mobile-lang" role="group" aria-label={t("language")}>
            {LANGS.map((l) => (
              <button
                key={l}
                type="button"
                disabled={l === lang}
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
            {themeLabel}
          </button>
        </div>

        <div className="divider mobile-divider" />

        <Link className="mobile-nav-link" href="/" onClick={close}>
          {t("home")}
        </Link>

        {showProfileLink ? (
          <Link className="mobile-nav-link" href="/profile" onClick={close}>
            {t("profile")}
          </Link>
        ) : null}

        <div className="divider mobile-divider" />

        {!isAuthenticated ? (
          <>
            {!hideLogin ? (
              <Link className="mobile-nav-link" href="/login" onClick={close}>
                {t("login")}
              </Link>
            ) : null}

            {!hideRegister ? (
              <Link className="mobile-nav-link" href="/register" onClick={close}>
                {t("signup")}
              </Link>
            ) : null}
          </>
        ) : (
          <>
            {userEmail ? <div className="text-secondary mobile-user">{userEmail}</div> : null}

            <button type="button" className="mobile-nav-link" onClick={askLogout}>
              {t("logout")}
            </button>
          </>
        )}
      </nav>

      <ConfirmModal
        isOpen={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        onConfirm={confirmLogout}
        title={t("logoutConfirm.title")}
        description={t("logoutConfirm.description")}
        cancelLabel={t("logoutConfirm.cancel")}
        confirmLabel={t("logoutConfirm.confirm")}
      />
    </>
  );
}
