import { test, expect } from "@playwright/test";
import { sel } from "../../helpers/ui/selectors";
import { openHome } from "../../helpers/app/open";
import { clickOutside, closeByEscape } from "../../helpers/ui/overlays";

test("overlays: user menu closes by click-outside and Escape", async ({ page }) => {
  await openHome(page, "en");

  await page.locator(sel.userMenuTrigger).click();
  await expect(page.locator(sel.userMenuPanel)).toBeVisible();

  await clickOutside(page);
  await expect(page.locator(sel.userMenuPanel)).toHaveCount(0);

  await page.locator(sel.userMenuTrigger).click();
  await expect(page.locator(sel.userMenuPanel)).toBeVisible();

  await closeByEscape(page);
  await expect(page.locator(sel.userMenuPanel)).toHaveCount(0);
});
