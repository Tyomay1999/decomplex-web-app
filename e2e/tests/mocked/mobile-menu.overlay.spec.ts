import { test, expect } from "@playwright/test";
import { openHome } from "../../helpers/app/open";
import { sel } from "../../helpers/ui/selectors";

test("mobile menu: clicking overlay closes it", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openHome(page, "en");

  await page.locator(sel.burger).click();
  await expect(page.locator(sel.mobileMenu)).toBeVisible();

  await page.locator(".mobile-menu-overlay").click();
  await expect(page.locator(sel.mobileMenu)).toHaveCount(0);
});
