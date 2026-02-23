import type { Page } from "@playwright/test";
import type { Lang } from "../env";
import { env } from "../env";
import { localePath, withBasePath } from "./url";

function toAbsoluteUrl(baseUrl: string, pathOrUrl: string): string {
  try {
    return new URL(pathOrUrl).toString();
  } catch {
    return new URL(pathOrUrl, baseUrl).toString();
  }
}

export async function openRoot(page: Page): Promise<void> {
  const p = withBasePath("/");
  await page.goto(toAbsoluteUrl(env.baseURL, p));
}

export async function openHome(page: Page, locale: Lang = env.locale): Promise<void> {
  const p = localePath(locale, "/");
  await page.goto(toAbsoluteUrl(env.baseURL, p));
}
