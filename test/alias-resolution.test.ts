import { describe, expect, it } from "vitest";
import { env } from "@/config/env";

describe("module resolution", () => {
  it("resolves @ alias to src", () => {
    expect(typeof env).toBe("object");
    expect(env).not.toBeNull();
  });
});
