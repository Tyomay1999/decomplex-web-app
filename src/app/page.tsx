"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { defaultLocale, localeSet } from "../i18n/config";
import type { Locale } from "../i18n/config";

function readCookie(name: string): string | null {
  const raw = document.cookie
    .split(";")
    .map((p) => p.trim())
    .find((p) => p.startsWith(`${name}=`));

  if (!raw) return null;

  const value = raw.slice(name.length + 1);
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function resolveLocale(): Locale {
  const v = readCookie("dc_locale") ?? readCookie("NEXT_LOCALE");
  if (typeof v === "string" && localeSet.has(v as Locale)) return v as Locale;
  return defaultLocale;
}

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const locale = resolveLocale();
    const target = `/${locale}`;

    if (window.location.pathname !== target) {
      router.replace(target, { scroll: false });
    }
  }, [router]);

  return null;
}
