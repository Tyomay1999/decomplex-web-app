import { test, expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";
import { installMockAuth } from "../../helpers/api/mockAuth";
import { localePath } from "../../helpers/app/url";
import { openHome } from "../../helpers/app/open";
import { sel } from "../../helpers/ui/selectors";

async function openUserMenu(page: Page): Promise<Locator> {
  const trigger = page.locator(sel.userMenuTrigger).first();
  await expect(trigger).toBeVisible({ timeout: 10_000 });

  await trigger.click();

  const panel = page.locator(sel.userMenuPanel).first();
  await expect(panel).toBeVisible({ timeout: 10_000 });

  return panel;
}

async function openLogoutConfirm(page: Page): Promise<Locator> {
  const panel = await openUserMenu(page);

  const logoutBtn = panel.getByRole("button", { name: /log\s*out|logout|sign\s*out/i }).first();
  await expect(logoutBtn).toBeVisible({ timeout: 10_000 });

  await logoutBtn.click();

  const dialog = page.locator(sel.confirmModal).first();
  await expect(dialog).toBeVisible({ timeout: 10_000 });

  return dialog;
}

async function getConfirmActions(dialog: Locator): Promise<{ cancel: Locator; confirm: Locator }> {
  const cancelByName = dialog.getByRole("button", { name: /cancel|close|no/i }).first();
  const confirmByName = dialog
    .getByRole("button", { name: /confirm|yes|log\s*out|logout|sign\s*out/i })
    .first();

  const hasCancel = (await cancelByName.count()) > 0;
  const hasConfirm = (await confirmByName.count()) > 0;

  if (hasCancel && hasConfirm) {
    return { cancel: cancelByName, confirm: confirmByName };
  }

  const buttons = dialog.getByRole("button");
  const count = await buttons.count();

  expect(count).toBeGreaterThanOrEqual(2);

  return {
    cancel: buttons.nth(count - 2),
    confirm: buttons.nth(count - 1),
  };
}

async function closeDialogByCancel(dialog: Locator): Promise<void> {
  const { cancel } = await getConfirmActions(dialog);

  await expect(cancel).toBeVisible({ timeout: 10_000 });
  await cancel.click({ trial: true });
  await cancel.click();

  await expect(dialog).toBeHidden({ timeout: 10_000 });
}

test("logout: open confirm modal -> cancel -> open -> confirm -> redirect to /login", async ({
  page,
}) => {
  const mock = await installMockAuth(page, {
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

  const dialog1 = await openLogoutConfirm(page);
  await closeDialogByCancel(dialog1);

  const dialog2 = await openLogoutConfirm(page);
  const { confirm } = await getConfirmActions(dialog2);

  await expect(confirm).toBeVisible({ timeout: 10_000 });

  const loginRe = new RegExp(`${localePath("en", "/login")}/?$`);

  await Promise.all([
    mock.waitForLoggedOut(),
    (async () => {
      await confirm.click({ trial: true });
      await confirm.click();
    })(),
  ]);

  await Promise.all([
    page.waitForURL(loginRe, { timeout: 20_000 }),
    expect(dialog2).toBeHidden({ timeout: 10_000 }),
  ]);
});
