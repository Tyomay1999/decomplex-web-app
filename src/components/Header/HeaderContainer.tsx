"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";

import Header from "./Header";
import type { Lang } from "./types";

import { useAppSelector } from "../../store/hooks";
import { useLogoutMutation, useMeQuery } from "../../features/auth/authApi";
import { getAccessTokenFromCookie, getRefreshTokenFromCookie } from "../../lib/authCookies";

function isLang(v: unknown): v is Lang {
  return v === "en" || v === "hy" || v === "ru";
}

export default function HeaderContainer() {
  const router = useRouter();
  const params = useParams<{ locale?: string }>();

  const locale: Lang = useMemo(() => {
    const l = params?.locale;
    return isLang(l) ? l : "en";
  }, [params?.locale]);

  const user = useAppSelector((s) => s.auth.user);

  const hasSessionHint = useMemo(() => {
    if (user) return true;
    const at = getAccessTokenFromCookie();
    const rt = getRefreshTokenFromCookie();
    return Boolean(at || rt);
  }, [user]);

  const { isLoading } = useMeQuery(undefined, {
    skip: !hasSessionHint,
    refetchOnMountOrArgChange: true,
  });
  const [logout] = useLogoutMutation();

  const isAuthenticated = Boolean(user);

  const onLogout = async () => {
    try {
      await logout().unwrap();
    } finally {
      router.replace(`/${locale}/login`);
    }
  };

  useEffect(() => {}, [isLoading]);

  return (
    <Header isAuthenticated={isAuthenticated} userEmail={user?.email ?? null} onLogout={onLogout} />
  );
}
