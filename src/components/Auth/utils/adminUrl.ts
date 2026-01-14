export function getAdminUrl(): string {
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://localhost:5173/";
  }
  return "https://decomplex-admin.tyomay.dev/";
}
