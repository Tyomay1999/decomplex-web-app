import { test, expect } from "@playwright/test";
import { sel } from "../../helpers/ui/selectors";

const base = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3100";

test("responsive: burger opens mobile menu", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/en`);

  const burger = page.locator(sel.burger);
  await expect(burger).toBeVisible();

  await burger.click();
  await expect(page.locator(sel.mobileMenu)).toBeVisible();
});
