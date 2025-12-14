import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { defaultLocale, locales, Locale } from "../i18n/config";

function isLocale(v: string | undefined): v is Locale {
  return !!v && locales.includes(v as Locale);
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();

  const cookieLocale = cookieStore.get("dc_locale")?.value || cookieStore.get("NEXT_LOCALE")?.value;

  const lang = isLocale(cookieLocale) ? cookieLocale : defaultLocale;

  return (
    <html lang={lang} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
