"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo } from "react";
import { useParams } from "next/navigation";

import { useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/config";
import { defaultLocale, localeSet } from "@/i18n/config";
import { useAppSelector } from "@/store/hooks";

type Props = { children: ReactNode };

function toLocale(v: unknown): Locale {
  if (typeof v === "string" && localeSet.has(v as Locale)) return v as Locale;
  return defaultLocale;
}

export default function AuthLayout({ children }: Props) {
  const router = useRouter();
  const params = useParams<{ locale?: string }>();

  const locale = useMemo<Locale>(() => toLocale(params?.locale), [params?.locale]);

  const status = useAppSelector((s) => s.auth.status);
  const user = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    if (status === "idle" || status === "checking") return;

    if (status === "authenticated" && user) {
      router.replace("/", { locale, scroll: false });
    }
  }, [locale, router, status, user]);

  return <>{children}</>;
}
