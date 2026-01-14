export const locales = ["en", "hy", "ru"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeSet: ReadonlySet<Locale> = new Set(locales);
