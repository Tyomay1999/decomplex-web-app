import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function pathnameReFromPath(pathname: string): RegExp {
  const clean = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return new RegExp(`^${escapeRegExp(clean)}/?$`);
}

export async function expectPathname(page: Page, re: RegExp): Promise<void> {
  await expect.poll(() => new URL(page.url()).pathname).toMatch(re);
}
