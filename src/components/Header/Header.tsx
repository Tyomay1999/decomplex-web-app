"use client";

import { useCallback } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import { Link, useRouter } from "@/i18n/navigation";

import { BurgerButton, MobileMenu, UserMenu } from "./ui";

import { useHeaderNavState } from "./hooks";
import type { Lang, UiTheme } from "./types";

type Props = {
  locale: Lang;

  isAuthenticated: boolean;
  userEmail: string | null;

  theme: UiTheme;
  mounted: boolean;
  toggleTheme: () => void;

  onLogout: () => void;
};

function stripLocalePrefix(pathname: string): string {
  const parts = pathname.split("/");
  const seg = parts[1];

  if (seg === "en" || seg === "ru" || seg === "hy") {
    const rest = "/" + parts.slice(2).join("/");
    return rest === "/" ? "/" : rest.replace(/\/+$/, "") || "/";
  }

  return pathname.replace(/\/+$/, "") || "/";
}

export function Header({
  locale,
  isAuthenticated,
  userEmail,
  theme,
  mounted,
  toggleTheme,
  onLogout,
}: Props) {
  const t = useTranslations("header");
  const pathname = usePathname();
  const router = useRouter();

  const { mobileOpen, langOpen, toggleMobile, closeMobile, closeLang, toggleLang } =
    useHeaderNavState();

  const showProfileLink = isAuthenticated;

  const isLoginPage = Boolean(pathname?.endsWith("/login/") || pathname?.endsWith("/login"));
  const isRegisterPage = Boolean(
    pathname?.endsWith("/register/") || pathname?.endsWith("/register"),
  );

  const userMenuOpen = langOpen;

  const toggleUserMenu = useCallback(() => {
    toggleLang();
  }, [toggleLang]);

  const closeUserMenu = useCallback(() => {
    closeLang();
  }, [closeLang]);

  const switchLang = useCallback(
    (next: Lang) => {
      const cleanPath = stripLocalePrefix(pathname || "/");
      router.replace(cleanPath, { locale: next, scroll: false });
      closeLang();
    },
    [router, pathname, closeLang],
  );

  return (
    <header className="main-header bg-surface border-color">
      <Link className="logo" href="/" onClick={closeMobile}>
        <div className="logo-title text-primary">{t("brand")}</div>
        <div className="logo-subtitle text-secondary">{t("tagline")}</div>
      </Link>

      <div className="header-center">
        <Link className="nav-link" href="/">
          {t("home")}
        </Link>

        {showProfileLink ? (
          <Link className="nav-link" href="/profile">
            {t("profile")}
          </Link>
        ) : null}
      </div>

      <div className="header-actions">
        <div className="header-desktop-only">
          <UserMenu
            locale={locale}
            isAuthenticated={isAuthenticated}
            userEmail={userEmail}
            theme={theme}
            mounted={mounted}
            toggleTheme={toggleTheme}
            isOpen={userMenuOpen}
            onLangChange={switchLang}
            onToggle={toggleUserMenu}
            onClose={closeUserMenu}
            onLogout={onLogout}
            hideLogin={isLoginPage}
            hideRegister={isRegisterPage}
          />
        </div>

        <BurgerButton isOpen={mobileOpen} onToggle={toggleMobile} label={t("menu")} />
      </div>

      <MobileMenu
        isOpen={mobileOpen}
        onNavigate={closeMobile}
        isAuthenticated={isAuthenticated}
        userEmail={userEmail}
        showProfileLink={showProfileLink}
        lang={locale}
        theme={theme}
        onToggleTheme={toggleTheme}
        onLangChange={switchLang}
        hideLogin={isLoginPage}
        hideRegister={isRegisterPage}
        onLogout={onLogout}
      />
    </header>
  );
}
