import { expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";
import { sel } from "./selectors";

export type UiTheme = "light" | "dark";

const STORAGE_KEY = "ui-theme";
const SESSION_GUARD_KEY = "__e2e_theme_seeded__";

export async function setThemeBeforeLoad(page: Page, theme: UiTheme): Promise<void> {
  await page.addInitScript(
    ({ t, storageKey, guardKey }) => {
      try {
        if (sessionStorage.getItem(guardKey) === "1") return;

        sessionStorage.setItem(guardKey, "1");
        localStorage.setItem(storageKey, t);
      } catch {
        // ignore
      }
    },
    { t: theme, storageKey: STORAGE_KEY, guardKey: SESSION_GUARD_KEY },
  );
}

async function readDomTheme(page: Page): Promise<UiTheme | null> {
  return await page.evaluate(() => {
    const html = document.documentElement;
    const body = document.body;

    const has = (el: Element | null, cls: string) => Boolean(el && el.classList.contains(cls));

    if (has(body, "dark") || has(html, "dark")) return "dark";
    if (has(body, "light") || has(html, "light")) return "light";
    return null;
  });
}

async function readStoredTheme(page: Page): Promise<UiTheme | null> {
  return await page.evaluate((k) => {
    try {
      const v = localStorage.getItem(k);
      return v === "light" || v === "dark" ? v : null;
    } catch {
      return null;
    }
  }, STORAGE_KEY);
}

async function readThemeSnapshot(
  page: Page,
): Promise<{ dom: UiTheme | null; stored: UiTheme | null }> {
  const [dom, stored] = await Promise.all([readDomTheme(page), readStoredTheme(page)]);
  return { dom, stored };
}

export async function expectDomTheme(page: Page, theme: UiTheme): Promise<void> {
  await expect.poll(async () => await readDomTheme(page), { timeout: 20_000 }).toBe(theme);
}

export async function expectStoredTheme(page: Page, theme: UiTheme): Promise<void> {
  await expect.poll(async () => await readStoredTheme(page), { timeout: 20_000 }).toBe(theme);
}

async function waitThemeApplied(page: Page, target: UiTheme, timeout = 5_000): Promise<void> {
  await expect.poll(async () => await readStoredTheme(page), { timeout }).toBe(target);
  await expect.poll(async () => await readDomTheme(page), { timeout }).toBe(target);
}

async function isVisible(locator: Locator): Promise<boolean> {
  if ((await locator.count()) === 0) return false;
  return await locator.first().isVisible();
}

async function openMobileMenu(page: Page): Promise<boolean> {
  const burger = page.locator(sel.burger).first();
  if (!(await isVisible(burger))) return false;

  const expanded = await burger.getAttribute("aria-expanded");
  if (expanded !== "true") {
    await burger.click();
  }

  const menu = page.locator(sel.mobileMenu).first();
  await expect(menu).toBeVisible({ timeout: 10_000 });

  const btn = menu.locator(sel.themeToggle).first();
  await expect(btn).toBeVisible({ timeout: 10_000 });
  await btn.scrollIntoViewIfNeeded();
  await btn.click({ trial: true });

  return true;
}

async function openDesktopUserMenu(page: Page): Promise<boolean> {
  const trigger = page.locator(sel.userMenuTrigger).first();
  if (!(await isVisible(trigger))) return false;

  await trigger.click();
  await expect(page.locator(sel.userMenuPanel)).toBeVisible({ timeout: 10_000 });
  return true;
}

export async function toggleTheme(page: Page): Promise<void> {
  const snap = await readThemeSnapshot(page);
  const before: UiTheme = snap.stored ?? snap.dom ?? "light";
  const target: UiTheme = before === "light" ? "dark" : "light";

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const opened = await openMobileMenu(page);
    if (!opened) break;

    const menu = page.locator(sel.mobileMenu).first();
    const btn = menu.locator(sel.themeToggle).first();

    await btn.click({ trial: true });
    await btn.click();

    try {
      await waitThemeApplied(page, target, 3_000);
      return;
    } catch {
      const burger = page.locator(sel.burger).first();
      if ((await burger.count()) > 0) {
        const expanded = await burger.getAttribute("aria-expanded");
        if (expanded === "true") {
          await burger.click().catch(() => {});
        }
      }
    }
  }

  const desktopOpened = await openDesktopUserMenu(page);
  if (desktopOpened) {
    const btn = page.locator(sel.themeToggle).first();
    await expect(btn).toBeVisible({ timeout: 10_000 });
    await btn.click({ trial: true });
    await btn.click();

    await waitThemeApplied(page, target, 10_000);
    return;
  }

  const finalSnap = await readThemeSnapshot(page);
  throw new Error(
    `toggleTheme failed: target="${target}" dom="${finalSnap.dom ?? "null"}" stored="${finalSnap.stored ?? "null"}"`,
  );
}
