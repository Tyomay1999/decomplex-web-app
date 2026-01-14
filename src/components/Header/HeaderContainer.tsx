"use client";

import { useMemo } from "react";
import { useRouter } from "@/i18n/navigation";

import { useAppSelector } from "@/store/hooks";
import { useLogoutMutation, useMeQuery } from "@/features/auth/authApi";
import { getAccessTokenFromCookie, getRefreshTokenFromCookie } from "@/lib/authCookies";

import { Header } from "./Header";
import { useThemePreference, useHeaderLocale } from "./hooks";

export function HeaderContainer() {
  const router = useRouter();
  const locale = useHeaderLocale();

  const user = useAppSelector((s) => s.auth.user);

  const hasSessionHint = useMemo(() => {
    if (user) return true;
    const at = getAccessTokenFromCookie();
    const rt = getRefreshTokenFromCookie();
    return Boolean(at || rt);
  }, [user]);

  useMeQuery(undefined, {
    skip: !hasSessionHint,
    refetchOnMountOrArgChange: true,
  });

  const [logout] = useLogoutMutation();

  const isAuthenticated = Boolean(user);

  const onLogout = async () => {
    try {
      await logout().unwrap();
    } finally {
      router.replace("/login");
    }
  };

  const { theme, mounted, toggleTheme } = useThemePreference();

  return (
    <Header
      locale={locale}
      isAuthenticated={isAuthenticated}
      userEmail={user?.email ?? null}
      theme={theme}
      mounted={mounted}
      toggleTheme={toggleTheme}
      onLogout={onLogout}
    />
  );
}
