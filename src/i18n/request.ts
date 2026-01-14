import { getRequestConfig } from "next-intl/server";
import type { AbstractIntlMessages } from "next-intl";
import { defaultLocale, localeSet, locales } from "./config";
import type { Locale } from "./config";

function isLocale(v: unknown): v is Locale {
  return typeof v === "string" && localeSet.has(v as Locale);
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isAbstractIntlMessages(v: unknown): v is AbstractIntlMessages {
  if (!isRecord(v)) return false;

  for (const value of Object.values(v)) {
    if (typeof value === "string") continue;
    if (!isAbstractIntlMessages(value)) return false;
  }

  return true;
}

async function loadMessages(locale: Locale): Promise<AbstractIntlMessages> {
  const mod: unknown = await import(`../../messages/${locale}.json`);
  if (!isRecord(mod) || !("default" in mod)) {
    throw new Error(`Invalid messages module for locale: ${locale}`);
  }

  const messages: unknown = mod.default;
  if (!isAbstractIntlMessages(messages)) {
    throw new Error(`Invalid messages shape for locale: ${locale}`);
  }

  return messages;
}

export default getRequestConfig(async ({ locale }) => {
  const safeLocale: Locale = isLocale(locale) ? locale : defaultLocale;

  return {
    locale: safeLocale,
    messages: await loadMessages(safeLocale),
    availableLocales: locales,
  };
});
