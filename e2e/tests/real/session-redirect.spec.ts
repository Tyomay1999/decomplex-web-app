import { test, expect } from "@playwright/test";

const base = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3100";

function apiBase(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";
  return raw.replace(/\/$/, "");
}

function apiRe(baseUrl: string): RegExp {
  const safe = baseUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${safe}/`);
}

test("protected: anonymous -> redirected away from /profile", async ({ page }) => {
  const re = apiRe(apiBase());

  await page.route(re, async (route) => {
    const req = route.request();
    const url = req.url();
    const method = req.method();

    if (method === "GET" && url.endsWith("/auth/me")) {
      return route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ success: false, message: "Unauthorized" }),
      });
    }

    return route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({ success: false, message: "Not mocked in this test" }),
    });
  });

  await page.goto(`${base}/en/profile`, { waitUntil: "networkidle" });

  await expect(page).not.toHaveURL(/\/en\/profile\/?$/);

  await expect(page).toHaveURL(/\/en(?:\/login\/?|\/?)$/);
});
