const ACCESS_KEY = "dc_accessToken";
const REFRESH_KEY = "dc_refreshToken";

type CookieOptions = {
  maxAgeSeconds: number;
  path: string;
  sameSite: "Lax";
  secure: boolean;
  domain?: string;
};

function isBrowser(): boolean {
  return typeof document !== "undefined";
}

function isHttps(): boolean {
  if (typeof window === "undefined") return process.env.NODE_ENV === "production";
  return window.location.protocol === "https:";
}

function normalizeDomain(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const v = raw.trim();
  if (v.length === 0) return undefined;
  return v;
}

function getCookieDomain(): string | undefined {
  return normalizeDomain(process.env.NEXT_PUBLIC_COOKIE_DOMAIN);
}

function serializeCookie(name: string, value: string, opts: CookieOptions): string {
  const base = `${name}=${encodeURIComponent(value)}`;
  const maxAge = `Max-Age=${Math.max(0, Math.floor(opts.maxAgeSeconds))}`;
  const path = `Path=${opts.path}`;
  const sameSite = `SameSite=${opts.sameSite}`;
  const secure = opts.secure ? "Secure" : "";
  const domain = opts.domain ? `Domain=${opts.domain}` : "";

  const parts = [base, maxAge, path, sameSite, secure, domain].filter((p) => p.length > 0);
  return parts.join("; ");
}

function setCookie(name: string, value: string, maxAgeSeconds: number): void {
  if (!isBrowser()) return;

  const opts: CookieOptions = {
    maxAgeSeconds,
    path: "/",
    sameSite: "Lax",
    secure: isHttps(),
    domain: getCookieDomain(),
  };

  document.cookie = serializeCookie(name, value, opts);
}

function getCookie(name: string): string | null {
  if (!isBrowser()) return null;

  const pattern = new RegExp(`(?:^|;\\s*)${name}=([^;]+)`);
  const match = document.cookie.match(pattern);

  return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name: string): void {
  if (!isBrowser()) return;

  const opts: CookieOptions = {
    maxAgeSeconds: 0,
    path: "/",
    sameSite: "Lax",
    secure: isHttps(),
    domain: getCookieDomain(),
  };

  document.cookie = serializeCookie(name, "", opts);
}

export type AuthCookieTtl = {
  accessMaxAgeSeconds: number;
  refreshMaxAgeSeconds: number;
};

const defaultTtl: AuthCookieTtl = {
  accessMaxAgeSeconds: 60 * 60,
  refreshMaxAgeSeconds: 60 * 60 * 24 * 30,
};

export function setAuthCookies(
  accessToken: string,
  refreshToken: string,
  ttl: AuthCookieTtl = defaultTtl,
): void {
  if (accessToken) setCookie(ACCESS_KEY, accessToken, ttl.accessMaxAgeSeconds);
  if (refreshToken) setCookie(REFRESH_KEY, refreshToken, ttl.refreshMaxAgeSeconds);
}

export function getAccessTokenFromCookie(): string | null {
  return getCookie(ACCESS_KEY);
}

export function getRefreshTokenFromCookie(): string | null {
  return getCookie(REFRESH_KEY);
}

export function clearAuthCookies(): void {
  deleteCookie(ACCESS_KEY);
  deleteCookie(REFRESH_KEY);
}
