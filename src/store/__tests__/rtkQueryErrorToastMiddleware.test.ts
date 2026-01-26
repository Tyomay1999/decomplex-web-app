import { describe, expect, it } from "vitest";
import { createAsyncThunk } from "@reduxjs/toolkit";
import type { Dispatch, UnknownAction } from "@reduxjs/toolkit";
import { rtkQueryErrorToastMiddleware } from "../rtkQueryErrorToastMiddleware";
import { pushToast } from "@/features/notifications/notificationsSlice";

type CapturedAction = { type: string; payload?: unknown };

const makeRejectedWithValueAction = (payload: unknown) => {
  const thunk = createAsyncThunk<unknown, void, { rejectValue: unknown }>(
    "test/thunk",
    async () => {
      return null;
    },
  );

  return thunk.rejected(null, "req_1", undefined, payload);
};

function runMiddleware(action: unknown): CapturedAction[] {
  const captured: CapturedAction[] = [];

  const next = (a: unknown) => {
    if (typeof a === "object" && a !== null && "type" in a) {
      const obj = a as { type: unknown; payload?: unknown };
      if (typeof obj.type === "string") captured.push({ type: obj.type, payload: obj.payload });
    }
    return a;
  };

  const middleware = rtkQueryErrorToastMiddleware({
    dispatch: ((a: UnknownAction) => a) as Dispatch<UnknownAction>,
    getState: () => ({}),
  });

  middleware(next)(action);
  return captured;
}

function findPushToast(captured: CapturedAction[]): CapturedAction | undefined {
  return captured.find((a) => a.type === pushToast.type);
}

describe("rtkQueryErrorToastMiddleware", () => {
  it("pushes backend message when payload.data.message exists", () => {
    const action = makeRejectedWithValueAction({ data: { message: "Backend says no" } });

    const captured = runMiddleware(action);
    const pushed = findPushToast(captured);

    expect(pushed).toBeDefined();

    const payload = pushed?.payload as { message?: unknown; kind?: unknown } | undefined;
    expect(payload?.kind).toBe("error");
    expect(payload?.message).toBe("Backend says no");
  });

  it("falls back to network message for failed to fetch", () => {
    const action = makeRejectedWithValueAction({ error: "Failed to fetch" });

    const captured = runMiddleware(action);
    const pushed = findPushToast(captured);

    expect(pushed).toBeDefined();

    const payload = pushed?.payload as { message?: unknown; kind?: unknown } | undefined;
    expect(payload?.kind).toBe("error");
    expect(typeof payload?.message).toBe("string");
    expect(String(payload?.message).length > 0).toBe(true);
  });
});
