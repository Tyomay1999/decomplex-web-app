export const locales = ["en", "hy", "ru"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";
