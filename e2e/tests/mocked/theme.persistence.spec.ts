import { test } from "@playwright/test";
import { openHome } from "../../helpers/app/open";
import {
  expectDomTheme,
  expectStoredTheme,
  setThemeBeforeLoad,
  toggleTheme,
} from "../../helpers/ui/theme";

test("theme: reads localStorage and applies html/body classes", async ({ page }) => {
  await setThemeBeforeLoad(page, "dark");
  await openHome(page, "en");
  await expectDomTheme(page, "dark");
  await expectStoredTheme(page, "dark");
});

test("theme: toggle switches and persists", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  await setThemeBeforeLoad(page, "light");
  await openHome(page, "en");

  await expectDomTheme(page, "light");
  await expectStoredTheme(page, "light");

  await toggleTheme(page);

  await expectDomTheme(page, "dark");
  await expectStoredTheme(page, "dark");

  await page.reload();

  await expectDomTheme(page, "dark");
  await expectStoredTheme(page, "dark");
});
