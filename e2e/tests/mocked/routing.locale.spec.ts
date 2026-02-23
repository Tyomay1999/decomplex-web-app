import { test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { openHome, openRoot } from "../../helpers/app/open";
import { localePath } from "../../helpers/app/url";
import { expectPathname, pathnameReFromPath } from "../../helpers/ui/routing";
import { env } from "../../helpers/env";
import type { Lang } from "../../helpers/env";

async function setLocaleCookie(page: Page, locale: Lang): Promise<void> {
  const origin = new URL(env.baseURL).origin;

  await page.context().addCookies([
    {
      name: "dc_locale",
      value: locale,
      url: origin,
    },
  ]);
}

test("middleware: / redirects to /<locale>/ based on cookie or default", async ({ page }) => {
  await openRoot(page);
  await expectPathname(page, pathnameReFromPath(localePath("en", "/")));

  await setLocaleCookie(page, "ru");

  await openRoot(page);
  await expectPathname(page, pathnameReFromPath(localePath("ru", "/")));
});

test("middleware: keeps locale when already in segment", async ({ page }) => {
  await openHome(page, "hy");
  await expectPathname(page, pathnameReFromPath(localePath("hy", "/")));
});
