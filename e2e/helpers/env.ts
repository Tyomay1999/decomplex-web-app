export type Lang = "en" | "hy" | "ru";

function normalizeBasePath(v: string | undefined): string {
  const raw = (v ?? "").trim();
  if (!raw) return "";
  if (raw === "/") return "";
  return raw.startsWith("/") ? raw.replace(/\/+$/, "") : `/${raw.replace(/\/+$/, "")}`;
}

export const env = {
  baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3100",
  locale: (process.env.E2E_LOCALE as Lang | undefined) ?? "en",
  basePath: normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH),
} as const;
