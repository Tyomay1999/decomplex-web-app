const ACCESS_KEY = "dc_accessToken";
const REFRESH_KEY = "dc_refreshToken";

function setCookie(name: string, value: string, days = 7) {
  if (typeof document === "undefined") return;
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
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
