import { describe, expect, it } from "vitest";
import reducer, {
  clearSession,
  patchSession,
  setSession,
  setStatus,
} from "@/features/auth/authSlice";
import type { AuthState } from "@/features/auth/authSlice";
import type { UserDto } from "@/features/auth/types";

function makeUser(overrides: Partial<UserDto> = {}): UserDto {
  return {
    id: "u_1",
    email: "u1@test.com",
    role: "candidate",
    ...overrides,
  };
}

describe("authSlice", () => {
  it("returns initial state", () => {
    const state = reducer(undefined, { type: "init" });
    expect(state).toEqual<AuthState>({
      status: "idle",
      accessToken: null,
      refreshToken: null,
      fingerprintHash: null,
      user: null,
    });
  });

  it("setStatus updates status", () => {
    const s1 = reducer(undefined, setStatus("checking"));
    expect(s1.status).toBe("checking");

    const s2 = reducer(s1, setStatus("anonymous"));
    expect(s2.status).toBe("anonymous");
  });

  it("setSession stores tokens, fingerprint, user and derives authenticated status", () => {
    const user = makeUser();
    const s = reducer(
      undefined,
      setSession({
        accessToken: "at",
        refreshToken: "rt",
        fingerprintHash: "fp",
        user,
      }),
    );

    expect(s.accessToken).toBe("at");
    expect(s.refreshToken).toBe("rt");
    expect(s.fingerprintHash).toBe("fp");
    expect(s.user).toEqual(user);
    expect(s.status).toBe("authenticated");
  });

  it("setSession derives anonymous status when user is null", () => {
    const s = reducer(
      undefined,
      setSession({
        accessToken: "at",
        refreshToken: "rt",
        fingerprintHash: "fp",
        user: null,
      }),
    );

    expect(s.user).toBeNull();
    expect(s.status).toBe("anonymous");
  });

  it("patchSession updates only provided fields", () => {
    const user1 = makeUser({ id: "u_1" });
    const base = reducer(
      undefined,
      setSession({
        accessToken: "at1",
        refreshToken: "rt1",
        fingerprintHash: "fp1",
        user: user1,
      }),
    );

    const user2 = makeUser({ id: "u_2" });

    const s = reducer(
      base,
      patchSession({
        accessToken: "at2",
        user: user2,
      }),
    );

    expect(s.accessToken).toBe("at2");
    expect(s.refreshToken).toBe("rt1");
    expect(s.fingerprintHash).toBe("fp1");
    expect(s.user).toEqual(user2);
    expect(s.status).toBe("authenticated");
  });

  it("patchSession can nullify fields when key exists", () => {
    const user1 = makeUser();
    const base = reducer(
      undefined,
      setSession({
        accessToken: "at1",
        refreshToken: "rt1",
        fingerprintHash: "fp1",
        user: user1,
      }),
    );

    const s = reducer(
      base,
      patchSession({
        accessToken: null,
        refreshToken: null,
        fingerprintHash: null,
        user: null,
      }),
    );

    expect(s.accessToken).toBeNull();
    expect(s.refreshToken).toBeNull();
    expect(s.fingerprintHash).toBeNull();
    expect(s.user).toBeNull();
    expect(s.status).toBe("anonymous");
  });

  it("clearSession resets to initial with anonymous status", () => {
    const user = makeUser();
    const base = reducer(
      undefined,
      setSession({
        accessToken: "at",
        refreshToken: "rt",
        fingerprintHash: "fp",
        user,
      }),
    );

    const s = reducer(base, clearSession());

    expect(s).toEqual<AuthState>({
      status: "anonymous",
      accessToken: null,
      refreshToken: null,
      fingerprintHash: null,
      user: null,
    });
  });
});
