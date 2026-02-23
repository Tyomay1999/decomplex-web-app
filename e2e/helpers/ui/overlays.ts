import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { sel } from "./selectors";

export async function expectUserMenuOpen(page: Page): Promise<void> {
  await expect(page.locator(sel.userMenuPanel)).toBeVisible();
}

export async function expectUserMenuClosed(page: Page): Promise<void> {
  await expect(page.locator(sel.userMenuPanel)).toHaveCount(0);
}

export async function closeByEscape(page: Page): Promise<void> {
  await page.keyboard.press("Escape");
}

export async function clickOutside(page: Page): Promise<void> {
  await page.locator("body").click({ position: { x: 5, y: 5 } });
}
