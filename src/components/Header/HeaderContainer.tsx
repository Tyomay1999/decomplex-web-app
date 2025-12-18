"use client";

import { useParams, useRouter } from "next/navigation";
import { useLogoutMutation } from "../../features/auth/authApi";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { clearSession } from "../../features/auth/authSlice";
import { clearAuthCookies } from "../../lib/authCookies";

import Header from "./Header";

type Locale = "en" | "hy" | "ru";

export default function HeaderContainer() {
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const locale = (params?.locale ?? "en") as Locale;

  const dispatch = useAppDispatch();
  const auth = useAppSelector((s) => s.auth);

  const isAuthenticated = Boolean(auth.accessToken);
  const userEmail = auth.user?.email ?? null;

  const [logout, { isLoading }] = useLogoutMutation();

  const onLogout = async () => {
    try {
      await logout().unwrap();
    } finally {
      clearAuthCookies();
      dispatch(clearSession());
      router.push(`/${locale}/login`);
    }
  };

  return (
    <Header
      isAuthenticated={isAuthenticated}
      userEmail={userEmail}
      onLogout={isLoading ? undefined : onLogout}
    />
  );
}
