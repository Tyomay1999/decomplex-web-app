import type { AppDispatch, RootState } from "@/store/store";
import { clearAuthCookies, setAuthCookies } from "@/lib/authCookies";
import { getOrCreateFingerprint } from "@/lib/fingerprint";
import { clearSession, patchSession, setSession } from "@/features/auth/authSlice";
import type {
  CurrentResponseData,
  LoginResponseData,
  MeResponseData,
  RegisterCandidateResponseData,
  RegisterCompanyResponseData,
} from "./types";

type GetState = () => unknown;

function toRootState(getState: GetState): RootState {
  return getState() as RootState;
}

type PersistPayload = {
  accessToken: string;
  refreshToken: string;
  fingerprintHash: string | null;
  user: LoginResponseData["user"];
};

export function persistAuthSession(dispatch: AppDispatch, payload: PersistPayload) {
  const fp = payload.fingerprintHash ?? null;
  if (fp) getOrCreateFingerprint(fp);

  setAuthCookies(payload.accessToken, payload.refreshToken);

  dispatch(
    setSession({
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      fingerprintHash: fp,
      user: payload.user,
    }),
  );
}

export function onLoginSuccess(dispatch: AppDispatch, data: LoginResponseData) {
  persistAuthSession(dispatch, {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    fingerprintHash: data.fingerprintHash ?? null,
    user: data.user,
  });
}

export function onRegisterCandidateSuccess(
  dispatch: AppDispatch,
  data: RegisterCandidateResponseData,
) {
  persistAuthSession(dispatch, {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    fingerprintHash: data.fingerprintHash ?? null,
    user: data.user,
  });
}

export function onRegisterCompanySuccess(dispatch: AppDispatch, data: RegisterCompanyResponseData) {
  persistAuthSession(dispatch, {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    fingerprintHash: data.fingerprintHash ?? null,
    user: data.user,
  });
}

export function onCurrentOrMeSuccess(
  dispatch: AppDispatch,
  getState: GetState,
  data: CurrentResponseData | MeResponseData,
) {
  const state = toRootState(getState);

  dispatch(
    patchSession({
      user: data.user,
      fingerprintHash: state.auth.fingerprintHash,
    }),
  );
}

export function onLogoutFinally(dispatch: AppDispatch) {
  clearAuthCookies();
  dispatch(clearSession());
}
