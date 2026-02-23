import { test, expect } from "@playwright/test";
import { openHome } from "../../helpers/app/open";

test("home: renders without crash (no strict skeleton expectations)", async ({ page }) => {
  await openHome(page, "en");
  await expect(page.locator("header.main-header")).toBeVisible();
  await expect(page.locator("body")).toBeVisible();
});
