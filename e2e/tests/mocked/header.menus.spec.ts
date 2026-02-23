import { test, expect } from "@playwright/test";
import { openHome } from "../../helpers/app/open";
import { sel } from "../../helpers/ui/selectors";
import {
  clickOutside,
  closeByEscape,
  expectUserMenuClosed,
  expectUserMenuOpen,
} from "../../helpers/ui/overlays";

test("header: user menu opens/closes (click-outside, Escape)", async ({ page }) => {
  await openHome(page, "en");

  await expectUserMenuClosed(page);

  await page.locator(sel.userMenuTrigger).click();
  await expectUserMenuOpen(page);

  await clickOutside(page);
  await expectUserMenuClosed(page);

  await page.locator(sel.userMenuTrigger).click();
  await expectUserMenuOpen(page);

  await closeByEscape(page);
  await expectUserMenuClosed(page);
});

test("header: burger opens mobile menu; Escape closes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); // mobile-ish
  await openHome(page, "en");

  await expect(page.locator(sel.mobileMenu)).toHaveCount(0);

  await page.locator(sel.burger).click();
  await expect(page.locator(sel.mobileMenu)).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.locator(sel.mobileMenu)).toHaveCount(0);
});
