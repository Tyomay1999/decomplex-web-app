import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n/config";
import type { Locale } from "./i18n/config";

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

type MiddlewareDecision =
  | { kind: "next" }
  | { kind: "redirect"; pathname: string }
  | { kind: "intl"; locale: Locale };

function isLocale(v: string | undefined): v is Locale {
  return typeof v === "string" && locales.includes(v as Locale);
}

function getSegmentLocale(pathname: string): Locale | null {
  const seg = pathname.split("/")[1];
  return isLocale(seg) ? seg : null;
}

function shouldBypass(pathname: string): boolean {
  return pathname.startsWith("/_next") || pathname.includes(".");
}

function readCookieLocale(req: NextRequest): string | undefined {
  return req.cookies.get("NEXT_LOCALE")?.value || req.cookies.get("dc_locale")?.value;
}

export function decideIntl(pathname: string, cookieLocale?: string): MiddlewareDecision {
  if (shouldBypass(pathname)) return { kind: "next" };

  const segLocale = getSegmentLocale(pathname);
  if (!segLocale) {
    const resolved = isLocale(cookieLocale) ? cookieLocale : defaultLocale;
    const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
    return { kind: "redirect", pathname: `/${resolved}${normalized}` };
  }

  return { kind: "intl", locale: segLocale };
}

export function proxy(req: NextRequest): NextResponse {
  const pathname = req.nextUrl.pathname;
  const cookieLocale = readCookieLocale(req);

  const decision = decideIntl(pathname, cookieLocale);

  if (decision.kind === "next") return NextResponse.next();

  if (decision.kind === "redirect") {
    const url = req.nextUrl.clone();
    url.pathname = decision.pathname;
    return NextResponse.redirect(url);
  }

  const res = intlMiddleware(req);

  res.cookies.set("dc_locale", decision.locale, {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return res;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
