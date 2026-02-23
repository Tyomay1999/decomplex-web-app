import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").trim();
const isExport = process.env.NEXT_OUTPUT === "export";

const nextConfig: NextConfig = {
  ...(isExport ? { output: "export" as const } : {}),
  trailingSlash: isExport,
  images: isExport ? { unoptimized: true } : undefined,
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
};

export default withNextIntl(nextConfig);
