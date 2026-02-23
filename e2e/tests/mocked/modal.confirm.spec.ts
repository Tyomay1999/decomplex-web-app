import { test, expect } from "@playwright/test";
import { installMockAuth } from "../../helpers/api/mockAuth";
import { openHome } from "../../helpers/app/open";
import { sel } from "../../helpers/ui/selectors";

test("confirm modal: contract (dialog, overlay, close, 2 actions)", async ({ page }) => {
  await installMockAuth(page, {
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:4100/api",
    user: {
      id: "u1",
      email: "e2e.user@example.com",
      role: "user",
      userType: "candidate",
      language: "en",
    },
  });

  await openHome(page, "en");

  await page.locator(sel.userMenuTrigger).click();
  await expect(page.locator(sel.userMenuPanel)).toBeVisible();

  const logoutBtn = page.getByRole("button", { name: /logout|sign out/i });
  await expect(logoutBtn).toBeVisible();
  await logoutBtn.click();

  const dialog = page.locator(sel.confirmModal);
  await expect(dialog).toBeVisible();
  await expect(page.locator(sel.confirmOverlay)).toBeVisible();

  await expect(dialog.locator(sel.confirmClose)).toHaveCount(1);

  const buttons = dialog.getByRole("button");
  await expect(buttons).toHaveCount(3);

  await dialog.locator(sel.confirmClose).click();
  await expect(dialog).toHaveCount(0);
});
