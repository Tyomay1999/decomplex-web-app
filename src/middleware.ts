import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { locales, defaultLocale, Locale } from "./i18n/config";

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

function isLocale(v: string | undefined): v is Locale {
  return !!v && locales.includes(v as Locale);
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next();
  }

  const seg = pathname.split("/")[1];
  const cookieLocale = req.cookies.get("NEXT_LOCALE")?.value || req.cookies.get("dc_locale")?.value;

  if (!isLocale(seg)) {
    const resolved = isLocale(cookieLocale) ? cookieLocale : defaultLocale;

    const url = req.nextUrl.clone();
    url.pathname = `/${resolved}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;

    return NextResponse.redirect(url);
  }

  const res = intlMiddleware(req);

  res.cookies.set("dc_locale", seg, {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return res;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
