"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo } from "react";
import { useParams, usePathname } from "next/navigation";

import { useRouter } from "@/i18n/navigation";
import { useAppSelector } from "@/store/hooks";
import type { AuthStatus } from "@/features/auth/authSlice";
import type { Locale } from "@/i18n/config";
import { defaultLocale, localeSet } from "@/i18n/config";

function toLocale(v: unknown): Locale {
  if (typeof v === "string" && localeSet.has(v as Locale)) return v as Locale;
  return defaultLocale;
}

function isUnauthenticated(status: AuthStatus): boolean {
  return status === "anonymous";
}

function stripLocalePrefix(pathname: string, locale: Locale): string {
  const prefix = `/${locale}`;
  if (pathname === prefix) return "/";
  if (pathname.startsWith(`${prefix}/`)) {
    const rest = pathname.slice(prefix.length);
    return rest.length > 0 ? rest : "/";
  }
  return pathname;
}

type Props = { children: ReactNode };

export default function ProtectedLayout({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ locale?: string }>();

  const locale = useMemo<Locale>(() => toLocale(params?.locale), [params?.locale]);

  const status = useAppSelector((s) => s.auth.status);
  const user = useAppSelector((s) => s.auth.user);

  const shouldRedirect = isUnauthenticated(status) || (status === "authenticated" && !user);

  useEffect(() => {
    if (status === "idle" || status === "checking") return;
    if (!shouldRedirect) return;

    const base = `/${locale}/login`;

    const raw = typeof pathname === "string" && pathname.length > 0 ? pathname : `/${locale}`;
    const withoutLocale = stripLocalePrefix(raw, locale);

    const next =
      withoutLocale && withoutLocale !== "/"
        ? `${base}?redirect=${encodeURIComponent(withoutLocale)}`
        : base;

    router.replace(next, { scroll: false });
  }, [locale, pathname, router, shouldRedirect, status]);

  if (status === "idle" || status === "checking") return null;
  if (shouldRedirect) return null;

  return <>{children}</>;
}
