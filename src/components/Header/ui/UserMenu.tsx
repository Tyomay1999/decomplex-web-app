"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

import { ThemeToggle } from "./ThemeToggle";
import { LANGS } from "../types";
import type { Lang, UiTheme } from "../types";
import { ConfirmModal } from "@/components/shared/modal";

type Props = {
  locale: Lang;

  isAuthenticated: boolean;
  userEmail: string | null;

  theme: UiTheme;
  mounted: boolean;
  toggleTheme: () => void;
  onLangChange: (lang: Lang) => void;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;

  onLogout: () => void;

  hideLogin?: boolean;
  hideRegister?: boolean;
  isLoginPage?: boolean;
  isRegisterPage?: boolean;
};

function initials(email: string): string {
  const s = email.trim();
  if (!s) return "U";
  return s.slice(0, 1).toUpperCase();
}

export function UserMenu({
  locale,
  isAuthenticated,
  userEmail,
  theme,
  mounted,
  toggleTheme,
  isOpen,
  onToggle,
  onClose,
  onLogout,
  onLangChange,
  hideLogin = false,
  hideRegister = false,
  isLoginPage,
  isRegisterPage,
}: Props) {
  const t = useTranslations("header");
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const shouldShowLogin = useMemo(() => {
    if (isLoginPage) return false;
    if (isRegisterPage) return true;
    return !hideLogin;
  }, [isLoginPage, isRegisterPage, hideLogin]);

  const shouldShowRegister = useMemo(() => {
    if (isRegisterPage) return false;
    if (isLoginPage) return true;
    return !hideRegister;
  }, [isRegisterPage, isLoginPage, hideRegister]);

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (e: PointerEvent) => {
      const el = wrapRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) onClose();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  const avatarText = isAuthenticated && userEmail ? initials(userEmail) : null;

  const onAskLogout = () => {
    onClose();
    setLogoutConfirmOpen(true);
  };

  const onConfirmLogout = () => {
    setLogoutConfirmOpen(false);
    onLogout();
  };

  return (
    <>
      <div className="user-menu" ref={wrapRef}>
        {isAuthenticated ? (
          <button
            type="button"
            className="avatar-btn border-color bg-hover cursor-pointer"
            onClick={onToggle}
            aria-expanded={isOpen}
            aria-label={t("menu")}
            data-testid="user-menu-trigger"
          >
            <span className="avatar-circle text-primary">{avatarText}</span>
          </button>
        ) : (
          <button
            type="button"
            className="user-menu-icon-btn border-color bg-hover cursor-pointer"
            onClick={onToggle}
            aria-expanded={isOpen}
            aria-label={t("menu")}
            data-testid="user-menu-trigger"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M20 21a8 8 0 1 0-16 0"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M12 13a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>

            <span className={`user-menu-caret ${isOpen ? "open" : ""}`} aria-hidden="true">
              ▾
            </span>
          </button>
        )}

        {isOpen ? (
          <div
            className="user-menu__panel bg-surface border-color"
            role="menu"
            data-testid="user-menu-panel"
          >
            {isAuthenticated && userEmail ? (
              <div className="user-menu__section">
                <div className="user-menu__email text-secondary">{userEmail}</div>
              </div>
            ) : null}

            <div className="user-menu__section">
              <div className="user-menu__label text-secondary">{t("language")}</div>
              <div className="lang-segment" role="group" aria-label={t("language")}>
                {LANGS.map((l) => (
                  <button
                    key={l}
                    type="button"
                    className={`lang-segment__btn ${l === locale ? "active" : ""}`}
                    onClick={() => onLangChange(l)}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="user-menu__section user-menu__row">
              <div className="user-menu__label text-secondary">{t("theme.label")}</div>
              {mounted ? (
                <ThemeToggle theme={theme} onToggle={toggleTheme} label={t("theme.label")} />
              ) : (
                <div style={{ height: 36 }} />
              )}
            </div>

            <div className="user-menu__divider border-color" />

            {!isAuthenticated ? (
              <div className="user-menu__section user-menu__actions">
                {shouldShowLogin ? (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      onClose();
                      router.push("/login", { locale });
                    }}
                  >
                    {t("login")}
                  </button>
                ) : null}

                {shouldShowRegister ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      onClose();
                      router.push("/register", { locale });
                    }}
                  >
                    {t("signup")}
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="user-menu__section user-menu__actions">
                <button type="button" className="btn btn-outline" onClick={onAskLogout}>
                  {t("logout")}
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>

      <ConfirmModal
        isOpen={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        onConfirm={onConfirmLogout}
        title={t("logoutConfirm.title")}
        description={t("logoutConfirm.description")}
        cancelLabel={t("logoutConfirm.cancel")}
        confirmLabel={t("logoutConfirm.confirm")}
        icon={
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
        }
      />
    </>
  );
}
