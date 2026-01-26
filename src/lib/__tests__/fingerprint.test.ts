import { afterEach, describe, expect, it } from "vitest";
import { getOrCreateFingerprint } from "@/lib/fingerprint";

function clearStorage(): void {
  window.localStorage.clear();
}

describe("fingerprint", () => {
  afterEach(() => {
    if (typeof window !== "undefined") clearStorage();
  });

  it("returns server fingerprint and stores it", () => {
    const v = getOrCreateFingerprint("srv_fp");
    expect(v).toBe("srv_fp");
    expect(window.localStorage.getItem("dc_fingerprint")).toBe("srv_fp");
  });

  it("returns stored fingerprint when server value is empty", () => {
    window.localStorage.setItem("dc_fingerprint", "stored_fp");
    const v = getOrCreateFingerprint("");
    expect(v).toBe("stored_fp");
  });

  it("creates and stores fingerprint when none exists", () => {
    const v1 = getOrCreateFingerprint();
    expect(typeof v1).toBe("string");
    expect(v1.length > 0).toBe(true);
    expect(window.localStorage.getItem("dc_fingerprint")).toBe(v1);

    const v2 = getOrCreateFingerprint();
    expect(v2).toBe(v1);
  });

  it("returns serverFingerprint or empty string when window is unavailable", () => {
    const prev = Object.getOwnPropertyDescriptor(globalThis, "window");

    try {
      Object.defineProperty(globalThis, "window", {
        value: undefined,
        configurable: true,
      });

      const a = getOrCreateFingerprint("srv_only");
      expect(a).toBe("srv_only");

      const b = getOrCreateFingerprint();
      expect(b).toBe("");
    } finally {
      if (prev) {
        Object.defineProperty(globalThis, "window", prev);
      } else {
        delete (globalThis as unknown as { window?: unknown }).window;
      }
    }
  });
});
