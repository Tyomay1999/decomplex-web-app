import { afterEach, describe, expect, it, vi } from "vitest";
import {
  clearAuthCookies,
  getAccessTokenFromCookie,
  getRefreshTokenFromCookie,
  setAuthCookies,
} from "@/lib/authCookies";

function clearAllCookies(): void {
  const cookieStr = typeof document !== "undefined" ? document.cookie : "";
  const names = cookieStr
    .split(";")
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .map((p) => p.split("=")[0])
    .filter((n) => n.length > 0);

  for (const name of names) {
    document.cookie = `${name}=; Max-Age=0; Path=/`;
  }
}

describe("authCookies", () => {
  afterEach(() => {
    if (typeof document !== "undefined") clearAllCookies();
    vi.unstubAllEnvs();
  });

  it("sets and reads access and refresh cookies", () => {
    expect(getAccessTokenFromCookie()).toBeNull();
    expect(getRefreshTokenFromCookie()).toBeNull();

    setAuthCookies("a1", "r1");

    expect(getAccessTokenFromCookie()).toBe("a1");
    expect(getRefreshTokenFromCookie()).toBe("r1");
  });

  it("clears auth cookies", () => {
    setAuthCookies("a2", "r2");
    expect(getAccessTokenFromCookie()).toBe("a2");
    expect(getRefreshTokenFromCookie()).toBe("r2");

    clearAuthCookies();

    expect(getAccessTokenFromCookie()).toBeNull();
    expect(getRefreshTokenFromCookie()).toBeNull();
  });

  it("does nothing when document is unavailable", () => {
    const prev = Object.getOwnPropertyDescriptor(globalThis, "document");

    try {
      Object.defineProperty(globalThis, "document", {
        value: undefined,
        configurable: true,
      });

      expect(() => setAuthCookies("a3", "r3")).not.toThrow();
      expect(() => clearAuthCookies()).not.toThrow();
      expect(getAccessTokenFromCookie()).toBeNull();
      expect(getRefreshTokenFromCookie()).toBeNull();
    } finally {
      if (prev) {
        Object.defineProperty(globalThis, "document", prev);
      } else {
        delete (globalThis as unknown as { document?: unknown }).document;
      }
    }
  });

  it("encodes and decodes cookie values", () => {
    setAuthCookies("a b", "r%2");
    expect(getAccessTokenFromCookie()).toBe("a b");
    expect(getRefreshTokenFromCookie()).toBe("r%2");
  });
});
