"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/config";
import { defaultLocale, localeSet } from "@/i18n/config";

import { useLoginMutation } from "@/features/auth/authApi";
import {
  AuthCard,
  AuthField,
  AuthFooterLink,
  AuthPrimaryButton,
  RememberMe,
  getAdminUrl,
} from "@/components/Auth";

type Params = { locale?: string };

function toLocale(v: unknown): Locale {
  if (typeof v === "string" && localeSet.has(v as Locale)) return v as Locale;
  return defaultLocale;
}

function normalizeRedirect(value: string | null, locale: Locale): string {
  if (!value) return `/${locale}`;

  const v = value.trim();
  if (v.length === 0) return `/${locale}`;
  if (!v.startsWith("/")) return `/${locale}`;

  const prefix = `/${locale}`;
  if (v === prefix || v.startsWith(`${prefix}/`)) return v;

  return `${prefix}${v === "/" ? "" : v}`;
}

export function LoginClient() {
  const tCommon = useTranslations("Common");
  const tAuth = useTranslations("Auth");

  const router = useRouter();
  const params = useParams<Params>();
  const locale = useMemo<Locale>(() => toLocale(params?.locale), [params?.locale]);

  const searchParams = useSearchParams();
  const redirectTo = normalizeRedirect(searchParams.get("redirect"), locale);

  const [login, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberUser, setRememberUser] = useState(true);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const data = await login({
        email,
        password,
        rememberUser,
        language: locale,
      }).unwrap();

      if (data.userType === "company") {
        window.location.assign(getAdminUrl());
        return;
      }

      router.replace(redirectTo, { scroll: false });
    } catch {
      return;
    }
  };

  return (
    <AuthCard title={tAuth("title")} subtitle={tAuth("subtitleLogin")}>
      <form className="auth-form" onSubmit={onSubmit}>
        <AuthField
          id="login-email"
          label={tAuth("email")}
          type="email"
          value={email}
          onChange={setEmail}
          placeholder={tAuth("placeholders.email")}
          required
          autoComplete="email"
        />

        <AuthField
          id="login-password"
          label={tAuth("password")}
          type="password"
          value={password}
          onChange={setPassword}
          placeholder={tAuth("placeholders.password")}
          required
          autoComplete="current-password"
        />

        <RememberMe checked={rememberUser} onChange={setRememberUser} label={tAuth("rememberMe")} />

        <AuthPrimaryButton disabled={isLoading}>
          {isLoading ? tCommon("loading") : tCommon("login")}
        </AuthPrimaryButton>
      </form>

      <AuthFooterLink
        text={tAuth("noAccount")}
        linkText={tAuth("signUp")}
        onClick={() => router.push("/register", { locale, scroll: false })}
      />
    </AuthCard>
  );
}
