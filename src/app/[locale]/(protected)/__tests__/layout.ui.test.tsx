import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";

type ReplaceFn = (href: string, opts?: { scroll?: boolean }) => void;

const replaceMock = vi.fn<ReplaceFn>();

vi.mock("next/navigation", () => {
  return {
    usePathname: () => "/ru/profile",
    useParams: () => ({ locale: "ru" }),
  };
});

vi.mock("@/i18n/navigation", () => {
  return {
    useRouter: () => ({ replace: replaceMock }),
  };
});

type AuthStatus = "idle" | "checking" | "authenticated" | "anonymous";

type UserDto = {
  id: string;
  email: string;
  role: string;
  language?: "en" | "hy" | "ru" | null;
  firstName?: string | null;
  lastName?: string | null;
  userType?: "candidate" | "company" | null;
};

type RootState = {
  auth: { status: AuthStatus; user: UserDto | null };
};

let state: RootState = {
  auth: { status: "idle", user: null },
};

vi.mock("@/store/hooks", () => {
  return {
    useAppSelector: (sel: (s: RootState) => unknown) => sel(state),
  };
});

import ProtectedLayout from "../layout";

function wrap(ui: ReactNode) {
  return render(<>{ui}</>);
}

describe("ProtectedLayout", () => {
  beforeEach(() => {
    replaceMock.mockClear();
    state = { auth: { status: "idle", user: null } };
  });

  it("renders nothing while checking", () => {
    state = { auth: { status: "checking", user: null } };
    const { container } = wrap(<ProtectedLayout>ok</ProtectedLayout>);
    expect(container.textContent).toBe("");
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("redirects anonymous to login with redirect param", () => {
    state = { auth: { status: "anonymous", user: null } };
    wrap(<ProtectedLayout>ok</ProtectedLayout>);
    expect(replaceMock).toHaveBeenCalledTimes(1);
    expect(replaceMock).toHaveBeenCalledWith("/ru/login?redirect=%2Fprofile", { scroll: false });
  });

  it("redirects authenticated without user", () => {
    state = { auth: { status: "authenticated", user: null } };
    wrap(<ProtectedLayout>ok</ProtectedLayout>);
    expect(replaceMock).toHaveBeenCalledTimes(1);
    expect(replaceMock).toHaveBeenCalledWith("/ru/login?redirect=%2Fprofile", { scroll: false });
  });

  it("renders children when authenticated with user", () => {
    state = {
      auth: {
        status: "authenticated",
        user: { id: "1", email: "a@b.c", role: "user", language: "ru" },
      },
    };
    wrap(
      <ProtectedLayout>
        <div>inside</div>
      </ProtectedLayout>,
    );
    expect(screen.getByText("inside")).toBeDefined();
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
