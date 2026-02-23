import type { Lang } from "../env";
import { env } from "../env";

function joinPaths(a: string, b: string): string {
  const left = a.endsWith("/") ? a.slice(0, -1) : a;
  const right = b.startsWith("/") ? b : `/${b}`;
  return `${left}${right}`;
}

export function withBasePath(pathname: string): string {
  const clean = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const bp = env.basePath;
  if (!bp) return clean;
  return joinPaths(bp, clean);
}

export function localePath(locale: Lang, pathname: string): string {
  const clean = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const core = `/${locale}${clean}`.replace(/\/+$/, "") || `/${locale}`;
  return withBasePath(core);
}
