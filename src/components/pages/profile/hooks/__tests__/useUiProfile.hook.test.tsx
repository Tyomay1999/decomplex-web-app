import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";

import { useUiProfile } from "../useUiProfile";

type UiProfile = {
  fullName: string;
  email: string;
  userType: "candidate" | "company";
  memberSinceIso: string | null;
};

describe("useUiProfile", () => {
  it("builds full name from primary firstName and lastName", () => {
    const primary = {
      firstName: "John",
      lastName: "Smith",
      email: "john@a.com",
      userType: "company",
    };
    const fallback = {
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@a.com",
      userType: "candidate",
    };

    const { result } = renderHook(
      () => useUiProfile(primary, fallback, "Fallback Name") as UiProfile,
    );

    expect(result.current.fullName).toBe("John Smith");
    expect(result.current.email).toBe("john@a.com");
    expect(result.current.userType).toBe("company");
  });

  it("falls back to fallback fields when primary is missing", () => {
    const primary: unknown = {};
    const fallback = {
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@a.com",
      userType: "candidate",
    };

    const { result } = renderHook(
      () => useUiProfile(primary, fallback, "Fallback Name") as UiProfile,
    );

    expect(result.current.fullName).toBe("Jane Doe");
    expect(result.current.email).toBe("jane@a.com");
    expect(result.current.userType).toBe("candidate");
  });

  it("uses single name when first/last are missing", () => {
    const primary = { name: "Single Name", email: "x@a.com" };
    const fallback = { name: "Fallback Single", email: "y@a.com" };

    const { result } = renderHook(
      () => useUiProfile(primary, fallback, "Fallback Name") as UiProfile,
    );

    expect(result.current.fullName).toBe("Single Name");
    expect(result.current.email).toBe("x@a.com");
  });

  it("uses fallbackName when no usable name exists", () => {
    const primary = { firstName: "   ", lastName: "   ", name: "   " };
    const fallback = { firstName: "", lastName: "", name: "" };

    const { result } = renderHook(
      () => useUiProfile(primary, fallback, "Fallback Name") as UiProfile,
    );

    expect(result.current.fullName).toBe("Fallback Name");
  });

  it("trims string fields and treats blank strings as missing", () => {
    const primary = { firstName: "  John  ", lastName: "  Smith  ", email: "  john@a.com  " };
    const fallback = { firstName: "Jane", lastName: "Doe", email: "jane@a.com" };

    const { result } = renderHook(
      () => useUiProfile(primary, fallback, "Fallback Name") as UiProfile,
    );

    expect(result.current.fullName).toBe("John Smith");
    expect(result.current.email).toBe("john@a.com");
  });

  it("defaults userType to candidate for unknown values", () => {
    const primary = { userType: "admin" };
    const fallback = { userType: "company" };

    const { result } = renderHook(
      () => useUiProfile(primary, fallback, "Fallback Name") as UiProfile,
    );

    expect(result.current.userType).toBe("candidate");
  });

  it("resolves memberSinceIso from createdAt or registeredAt with correct priority", () => {
    const primary = { registeredAt: "2026-01-10T00:00:00.000Z" };
    const fallback = {
      createdAt: "2026-01-01T00:00:00.000Z",
      registeredAt: "2026-01-02T00:00:00.000Z",
    };

    const { result } = renderHook(
      () => useUiProfile(primary, fallback, "Fallback Name") as UiProfile,
    );

    expect(result.current.memberSinceIso).toBe("2026-01-01T00:00:00.000Z");
  });

  it("returns empty email when missing", () => {
    const primary = { firstName: "John", lastName: "Smith" };
    const fallback = { firstName: "Jane", lastName: "Doe" };

    const { result } = renderHook(
      () => useUiProfile(primary, fallback, "Fallback Name") as UiProfile,
    );

    expect(result.current.email).toBe("");
  });
});
