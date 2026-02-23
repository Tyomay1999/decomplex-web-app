import { test, expect } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

const base = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3100";

function apiBase(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";
  return raw.replace(/\/$/, "");
}

function apiRe(baseUrl: string): RegExp {
  const safe = baseUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${safe}/`);
}

function ensureFixtureFile(): { name: string; mime: string; buffer: Buffer } {
  const p = path.resolve(process.cwd(), "e2e/fixtures/files/resume.pdf");
  if (fs.existsSync(p)) {
    return { name: "resume.pdf", mime: "application/pdf", buffer: fs.readFileSync(p) };
  }
  const minimal = Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF\n");
  return { name: "resume.pdf", mime: "application/pdf", buffer: minimal };
}

function baseOrigin(): { origin: string; host: string } {
  const u = new URL(base);
  return { origin: u.origin, host: u.hostname };
}

test("apply: POST /vacancies/:id/apply is sent and success toast shown", async ({ page }) => {
  const re = apiRe(apiBase());
  const { origin, host } = baseOrigin();

  await page.goto(`${origin}/en`, { waitUntil: "domcontentloaded" });

  await page.context().addCookies([
    {
      name: "dc_accessToken",
      value: "e2e_access",
      domain: host,
      path: "/",
    },
    {
      name: "dc_refreshToken",
      value: "e2e_refresh",
      domain: host,
      path: "/",
    },
  ]);

  let applySeen = false;

  await page.route(re, async (route) => {
    const req = route.request();
    const url = req.url();
    const method = req.method();

    if (method === "GET" && url.endsWith("/auth/me")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            user: {
              id: "u1",
              email: "e2e@example.com",
              role: "candidate",
              userType: "candidate",
              language: "en",
              firstName: "E2E",
              lastName: "User",
            },
          },
        }),
      });
      return;
    }

    if (method === "GET" && /\/vacancies\/[^/]+$/.test(url)) {
      const id = url.split("/").pop() ?? "v1";
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            vacancy: {
              id,
              companyId: "c1",
              createdById: null,
              title: "Frontend Engineer",
              description: "Test vacancy",
              salaryFrom: 1000,
              salaryTo: 2000,
              jobType: "remote",
              location: "Yerevan",
              status: "active",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              hasApplied: false,
            },
          },
        }),
      });
      return;
    }

    if (method === "POST" && /\/vacancies\/[^/]+\/apply$/.test(url)) {
      applySeen = true;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: { success: true } }),
      });
      return;
    }

    await route.fallback();
  });

  await page.goto(`${origin}/en/vacancies/v1`);
  await expect(page.locator(".vacancy-details")).toBeVisible();

  const applyBtn = page.locator("button.btn.btn-primary");
  await expect(applyBtn).toBeVisible();
  await applyBtn.click();

  const modal = page.locator(".modal-overlay .modal");
  await expect(modal).toBeVisible();

  const fileInput = page.locator('input[type="file"]#resume-upload');
  const f = ensureFixtureFile();
  await fileInput.setInputFiles({
    name: f.name,
    mimeType: f.mime,
    buffer: f.buffer,
  });

  const submit = page.locator("#submit-application-btn");
  await expect(submit).toBeEnabled();
  await submit.click();

  await expect(page.locator(".toast-host")).toBeVisible();
  await expect(page.locator(".toast-card")).toContainText("Application sent successfully.");

  expect(applySeen).toBeTruthy();
});
