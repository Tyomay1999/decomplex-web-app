import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import type { UserDto } from "./types";

export type AuthStatus = "idle" | "checking" | "authenticated" | "anonymous";

export type AuthState = {
  status: AuthStatus;
  accessToken: string | null;
  refreshToken: string | null;
  fingerprintHash: string | null;
  user: UserDto | null;
};

export type SetSessionPayload = {
  accessToken: string | null;
  refreshToken: string | null;
  fingerprintHash: string | null;
  user: UserDto | null;
};

export type PatchSessionPayload = Partial<SetSessionPayload>;

const initialState: AuthState = {
  status: "idle",
  accessToken: null,
  refreshToken: null,
  fingerprintHash: null,
  user: null,
};

function computeStatus(next: Pick<AuthState, "user">): AuthStatus {
  return next.user ? "authenticated" : "anonymous";
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setStatus(state, action: PayloadAction<AuthStatus>) {
      state.status = action.payload;
    },

    setSession(state, action: PayloadAction<SetSessionPayload>) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.fingerprintHash = action.payload.fingerprintHash;
      state.user = action.payload.user;
      state.status = computeStatus({ user: state.user });
    },

    patchSession(state, action: PayloadAction<PatchSessionPayload>) {
      if ("accessToken" in action.payload) state.accessToken = action.payload.accessToken ?? null;
      if ("refreshToken" in action.payload)
        state.refreshToken = action.payload.refreshToken ?? null;
      if ("fingerprintHash" in action.payload)
        state.fingerprintHash = action.payload.fingerprintHash ?? null;
      if ("user" in action.payload) state.user = action.payload.user ?? null;

      state.status = computeStatus({ user: state.user });
    },

    clearSession() {
      return { ...initialState, status: "anonymous" as const };
    },
  },
});

export const { setStatus, setSession, patchSession, clearSession } = authSlice.actions;
export default authSlice.reducer;
