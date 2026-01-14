const rawApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH;

if (typeof rawApiBaseUrl !== "string" || rawApiBaseUrl.trim().length === 0) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
}

const normalizedBasePath = (() => {
  if (typeof rawBasePath !== "string") return "";
  const v = rawBasePath.trim();
  if (v === "" || v === "/") return "";
  return v.startsWith("/") ? v : `/${v}`;
})();

export const env = {
  apiBaseUrl: rawApiBaseUrl,
  basePath: normalizedBasePath,
} as const;

export type Env = typeof env;
