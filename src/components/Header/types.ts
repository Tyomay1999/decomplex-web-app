export const LANGS = ["en", "hy", "ru"] as const;
export type Lang = (typeof LANGS)[number];
