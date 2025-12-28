"use client";

import { Link } from "../../i18n/navigation";
import { useCallback, useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { MobileMenu } from "./MobileMenu";
import { LanguageDropdown } from "./LanguageDropdown";
import { ThemeToggle } from "./ThemeToggle";
import { BurgerButton } from "./BurgerButton";
import type { Lang } from "./types";

type Props = {
  isAuthenticated?: boolean;
  userEmail?: string | null;
  onLogout?: () => void;
};

export default function Header({ isAuthenticated = false, userEmail = null, onLogout }: Props) {
  const t = useTranslations("header");

  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ locale: Lang }>();

  const lang: Lang =
    params.locale === "en" || params.locale === "hy" || params.locale === "ru"
      ? params.locale
      : "en";

  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const saved = localStorage.getItem("ui-theme");
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    document.body.classList.remove("light", "dark");
    document.body.classList.add(theme);
    localStorage.setItem("ui-theme", theme);
  }, [theme, mounted]);

  const onToggleMobile = useCallback(() => setMobileOpen((v) => !v), []);
  const onToggleLangOpen = useCallback(() => setLangOpen((v) => !v), []);
  const onCloseLangOpen = useCallback(() => setLangOpen(false), []);
  const onCloseMobile = useCallback(() => setMobileOpen(false), []);

  const onToggleTheme = useCallback(() => {
    setTheme((p) => (p === "light" ? "dark" : "light"));
  }, []);

  const showProfileLink = isAuthenticated;

  const isLoginPage = pathname?.endsWith("/login");
  const isRegisterPage = pathname?.endsWith("/register");

  const switchLang = (next: Lang) => {
    if (!pathname) return;
    const nextPath = pathname.replace(/^\/(en|hy|ru)/, `/${next}`);
    router.replace(nextPath, { scroll: false });
    setLangOpen(false);
  };

  return (
    <header className="main-header bg-surface border-color">
      <Link className="logo" href="/" onClick={onCloseMobile}>
        <div className="logo-title text-primary">{t("brand")}</div>
        <div className="logo-subtitle text-secondary">{t("tagline")}</div>
      </Link>

      <div className="header-center">
        <Link className="nav-link" href="/">
          {t("home")}
        </Link>

        {showProfileLink && (
          <Link className="nav-link" href="/profile">
            {t("profile")}
          </Link>
        )}
      </div>

      <div className="header-actions">
        <div className="header-controls">
          <LanguageDropdown
            value={lang}
            isOpen={langOpen}
            onToggle={onToggleLangOpen}
            onClose={onCloseLangOpen}
            onChange={switchLang}
          />

          {mounted ? <ThemeToggle theme={theme} onToggle={onToggleTheme} /> : null}

          {!isAuthenticated ? (
            <div className="auth-actions">
              {!isLoginPage && (
                <Link className="btn btn-outline" href="/login">
                  {t("login")}
                </Link>
              )}
              {!isRegisterPage && (
                <Link className="btn btn-primary" href="/register">
                  {t("signup")}
                </Link>
              )}
            </div>
          ) : (
            <div
              className="auth-actions"
              style={{ display: "flex", alignItems: "center", gap: 12 }}
            >
              {userEmail && (
                <span className="text-secondary" style={{ fontSize: 14 }}>
                  {userEmail}
                </span>
              )}

              <button type="button" className="btn btn-outline logout" onClick={() => onLogout?.()}>
                {t("logout")}
              </button>
            </div>
          )}
        </div>

        <BurgerButton isOpen={mobileOpen} onToggle={onToggleMobile} />
      </div>

      <MobileMenu
        isOpen={mobileOpen}
        onNavigate={onCloseMobile}
        isAuthenticated={isAuthenticated}
        userEmail={userEmail}
        showProfileLink={showProfileLink}
        lang={lang}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onLangChange={switchLang}
        hideLogin={isLoginPage}
        hideRegister={isRegisterPage}
        onLogout={onLogout}
      />
    </header>
  );
}
