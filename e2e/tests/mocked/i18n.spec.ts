import { test, expect } from "@playwright/test";
import { openHome } from "../../helpers/app/open";

test("i18n: EN home renders", async ({ page }) => {
  await openHome(page, "en");
  await expect(page.locator("header.main-header")).toBeVisible();
});

test("i18n: RU home renders", async ({ page }) => {
  await openHome(page, "ru");
  await expect(page.locator("header.main-header")).toBeVisible();
});

test("i18n: HY home renders", async ({ page }) => {
  await openHome(page, "hy");
  await expect(page.locator("header.main-header")).toBeVisible();
});
