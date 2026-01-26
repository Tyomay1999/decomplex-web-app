import { describe, expect, it, vi } from "vitest";
import React from "react";
import { render } from "@testing-library/react";

import { SessionBootstrap } from "@/features/auth/SessionBootstrap";

type Action = {
  type: string;
  payload?: unknown;
};

type DispatchFn = (action: Action) => Action;

type AuthStatus = "idle" | "checking" | "authenticated" | "anonymous";

type RootStateLike = {
  auth: {
    status: AuthStatus;
  };
};

type MeQueryResult = {
  isSuccess: boolean;
  isError: boolean;
};

type UseMeQuery = (
  arg: undefined,
  opts: {
    skip: boolean;
    refetchOnMountOrArgChange: boolean;
    refetchOnReconnect: boolean;
    refetchOnFocus: boolean;
  },
) => MeQueryResult;

type StoreHooksModule = {
  useAppDispatch: () => DispatchFn;
  useAppSelector: <T>(selector: (s: RootStateLike) => T) => T;
};

type AuthApiModule = {
  useMeQuery: UseMeQuery;
};

const mocked = vi.hoisted(() => {
  const actions: Action[] = [];

  const dispatch: DispatchFn = (action: Action) => {
    actions.push(action);
    return action;
  };

  const state: RootStateLike = { auth: { status: "idle" } };

  const useAppDispatch = vi.fn<StoreHooksModule["useAppDispatch"]>(() => dispatch);

  const useAppSelectorImpl: StoreHooksModule["useAppSelector"] = <T,>(
    selector: (s: RootStateLike) => T,
  ): T => selector(state);

  const useAppSelector = vi
    .fn()
    .mockImplementation(useAppSelectorImpl) as unknown as StoreHooksModule["useAppSelector"];

  const useMeQuery = vi.fn<AuthApiModule["useMeQuery"]>(() => ({
    isSuccess: false,
    isError: false,
  }));

  return {
    actions,
    state,
    useAppDispatch,
    useAppSelector,
    useMeQuery,
  };
});

vi.mock(
  "@/store/hooks",
  (): StoreHooksModule => ({
    useAppDispatch: mocked.useAppDispatch,
    useAppSelector: mocked.useAppSelector,
  }),
);

vi.mock(
  "@/features/auth/authApi",
  (): AuthApiModule => ({
    useMeQuery: mocked.useMeQuery,
  }),
);

function resetMocks(): void {
  mocked.actions.length = 0;
  mocked.useAppDispatch.mockClear();
  mocked.useMeQuery.mockClear();
}

function setStatus(status: AuthStatus): void {
  mocked.state.auth.status = status;
}

function hasDispatchedTypeSuffix(suffix: string): boolean {
  return mocked.actions.some((a) => a.type.endsWith(suffix));
}

describe("SessionBootstrap", () => {
  it("dispatches checking when status is idle", () => {
    resetMocks();
    setStatus("idle");

    mocked.useMeQuery.mockReturnValue({ isSuccess: false, isError: false });

    render(<SessionBootstrap />);

    expect(mocked.useMeQuery).toHaveBeenCalledTimes(1);

    const call = mocked.useMeQuery.mock.calls[0];
    const opts = call?.[1];
    expect(opts.skip).toBe(false);

    expect(hasDispatchedTypeSuffix("/setStatus")).toBe(true);

    const setStatusAction = mocked.actions.find((a) => a.type.endsWith("/setStatus"));
    expect(setStatusAction?.payload).toBe("checking");
  });

  it("dispatches anonymous when status is checking and me isError", () => {
    resetMocks();
    setStatus("checking");

    mocked.useMeQuery.mockReturnValue({ isSuccess: false, isError: true });

    render(<SessionBootstrap />);

    expect(mocked.useMeQuery).toHaveBeenCalledTimes(1);

    expect(hasDispatchedTypeSuffix("/setStatus")).toBe(true);

    const setStatusAction = mocked.actions.find((a) => a.type.endsWith("/setStatus"));
    expect(setStatusAction?.payload).toBe("anonymous");
  });

  it("does not dispatch anonymous when status is checking and me isSuccess", () => {
    resetMocks();
    setStatus("checking");

    mocked.useMeQuery.mockReturnValue({ isSuccess: true, isError: false });

    render(<SessionBootstrap />);

    expect(mocked.useMeQuery).toHaveBeenCalledTimes(1);

    const anonymous = mocked.actions.filter(
      (a) => a.type.endsWith("/setStatus") && a.payload === "anonymous",
    );
    expect(anonymous.length).toBe(0);
  });

  it("does nothing when status is anonymous", () => {
    resetMocks();
    setStatus("anonymous");

    mocked.useMeQuery.mockReturnValue({ isSuccess: false, isError: false });

    render(<SessionBootstrap />);

    expect(mocked.useMeQuery).toHaveBeenCalledTimes(1);

    const call = mocked.useMeQuery.mock.calls[0];
    const opts = call?.[1];
    expect(opts.skip).toBe(true);

    expect(mocked.actions.length).toBe(0);
  });
});
