import { vi } from "vitest";

export type AuthCookiesModule = {
  clearAuthCookies: () => void;
  getAccessTokenFromCookie: () => string | null;
  getRefreshTokenFromCookie: () => string | null;
  setAuthCookies: (accessToken: string, refreshToken: string) => void;
};

export type AuthCookiesMockState = {
  accessToken: string | null;
  refreshToken: string | null;
};

export const authCookiesMock: AuthCookiesModule & AuthCookiesMockState = {
  clearAuthCookies: vi.fn<AuthCookiesModule["clearAuthCookies"]>(),
  getAccessTokenFromCookie: () => authCookiesMock.accessToken,
  getRefreshTokenFromCookie: () => authCookiesMock.refreshToken,
  setAuthCookies: vi.fn<AuthCookiesModule["setAuthCookies"]>(),
  accessToken: null,
  refreshToken: null,
};

export const resetAuthCookiesMock = (): void => {
  (authCookiesMock.clearAuthCookies as ReturnType<typeof vi.fn>).mockClear();
  (authCookiesMock.setAuthCookies as ReturnType<typeof vi.fn>).mockClear();
  authCookiesMock.accessToken = null;
  authCookiesMock.refreshToken = null;
};
