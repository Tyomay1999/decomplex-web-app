export type RoutePattern = string | RegExp;

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function apiPattern(apiBaseUrl: string): RoutePattern {
  const safe = escapeRegExp(apiBaseUrl.replace(/\/+$/, ""));
  return new RegExp(`^${safe}/`);
}

export function apiUrl(apiBaseUrl: string, path: string): string {
  const base = apiBaseUrl.replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
