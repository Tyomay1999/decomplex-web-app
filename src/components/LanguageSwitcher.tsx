"use client";

import { usePathname, useRouter } from "next/navigation";
import { locales, type Locale } from "../i18n/config";

function getLocaleFromPathname(pathname: string): Locale {
  const seg = pathname.split("/")[1];
  if (locales.includes(seg as Locale)) return seg as Locale;
  return "en";
}

function replaceLocale(pathname: string, nextLocale: Locale) {
  const parts = pathname.split("/");
  if (parts.length >= 2 && locales.includes(parts[1] as Locale)) {
    parts[1] = nextLocale;
    return parts.join("/") || `/${nextLocale}`;
  }
  return `/${nextLocale}${pathname.startsWith("/") ? "" : "/"}${pathname}`;
}

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const current = getLocaleFromPathname(pathname);

  return (
    <div style={{ display: "flex", gap: 8 }}>
      {locales.map((l) => (
        <button
          key={l}
          onClick={() => router.push(replaceLocale(pathname, l))}
          disabled={l === current}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
