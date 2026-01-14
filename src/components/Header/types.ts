export const LANGS = ["en", "hy", "ru"] as const;
export type Lang = (typeof LANGS)[number];

export type HeaderUser = {
  email?: string | null;
};

export type HeaderAuthState = {
  isAuthenticated: boolean;
  userEmail: string | null;
};

export type UiTheme = "light" | "dark";
