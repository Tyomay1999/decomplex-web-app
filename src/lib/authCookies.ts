const ACCESS_KEY = "dc_accessToken";
const REFRESH_KEY = "dc_refreshToken";

const COOKIE_DOMAIN = process.env.NODE_ENV === "production" ? ".tyomay.dev" : undefined;

function isHttps(): boolean {
  if (typeof window === "undefined") return process.env.NODE_ENV === "production";
  return window.location.protocol === "https:";
}

function setCookie(name: string, value: string, days = 7) {
  if (typeof document === "undefined") return;

  const maxAge = days * 24 * 60 * 60;
  const secure = isHttps() ? "; Secure" : "";
  const domain = COOKIE_DOMAIN ? `; Domain=${COOKIE_DOMAIN}` : "";

  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}${domain}`;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;

  const secure = isHttps() ? "; Secure" : "";
  const domain = COOKIE_DOMAIN ? `; Domain=${COOKIE_DOMAIN}` : "";

  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax${secure}${domain}`;
}

export function setAuthCookies(accessToken: string, refreshToken: string) {
  setCookie(ACCESS_KEY, accessToken);
  setCookie(REFRESH_KEY, refreshToken);
}

export function getAccessTokenFromCookie(): string | null {
  return getCookie(ACCESS_KEY);
}

export function getRefreshTokenFromCookie(): string | null {
  return getCookie(REFRESH_KEY);
}

export function clearAuthCookies() {
  deleteCookie(ACCESS_KEY);
  deleteCookie(REFRESH_KEY);
}
