import { describe, expect, it } from "vitest";

import { defaultLocale, localeSet, locales } from "../config";

describe("i18n/config", () => {
  it("exports supported locales", () => {
    expect(locales).toEqual(["en", "hy", "ru"]);
  });

  it("exports defaultLocale that exists in locales", () => {
    expect(defaultLocale).toBe("en");
    expect(locales.includes(defaultLocale)).toBe(true);
  });

  it("exports localeSet that matches locales", () => {
    expect(Array.from(localeSet)).toEqual(["en", "hy", "ru"]);
    expect(localeSet.has("en")).toBe(true);
    expect(localeSet.has("hy")).toBe(true);
    expect(localeSet.has("ru")).toBe(true);
  });
});
