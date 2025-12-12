import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type UserDto = {
  id: string;
  email: string;
  role: string;
  language?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  userType?: string | null;
};

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  fingerprintHash: string | null;
  user: UserDto | null;
};

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  fingerprintHash: null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{
        accessToken: string | null;
        refreshToken: string | null;
        fingerprintHash: string | null;
        user: UserDto | null;
      }>,
    ) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.fingerprintHash = action.payload.fingerprintHash;
      state.user = action.payload.user;
    },
    clearSession(state) {
      state.accessToken = null;
      state.refreshToken = null;
      state.fingerprintHash = null;
      state.user = null;
    },
  },
});

export const { setCredentials, clearSession } = authSlice.actions;
export default authSlice.reducer;
