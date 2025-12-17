"use client";

import { FormEvent, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";

import { useLoginMutation } from "../../../../features/auth/authApi";
import { AuthCard } from "../../../../components/Auth/AuthCard";
import { AuthField } from "../../../../components/Auth/AuthField";
import { AuthPrimaryButton } from "../../../../components/Auth/AuthPrimaryButton";
import { AuthFooterLink } from "../../../../components/Auth/AuthFooterLink";

type Locale = "en" | "hy" | "ru";

export default function LoginPage() {
  const tCommon = useTranslations("Common");
  const tAuth = useTranslations("Auth");

  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const locale = (params?.locale ?? "en") as Locale;

  const [login, { isLoading, error }] = useLoginMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberUser, setRememberUser] = useState(true);

  const errorText = useMemo(() => {
    if (!error) return null;
    return "Login failed. Please check your credentials.";
  }, [error]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password, rememberUser, language: locale }).unwrap();
      router.push(`/${locale}`);
    } catch {
      // handled via errorText
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
          placeholder="you@example.com"
          required
          autoComplete="email"
        />

        <AuthField
          id="login-password"
          label={tAuth("password")}
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />

        <label
          className="text-secondary"
          style={{ display: "flex", gap: 10, alignItems: "center" }}
        >
          <input
            type="checkbox"
            checked={rememberUser}
            onChange={(e) => setRememberUser(e.target.checked)}
          />
          {tAuth("rememberMe")}
        </label>

        {errorText ? <div style={{ color: "#EF4444", fontSize: 14 }}>{errorText}</div> : null}

        <AuthPrimaryButton disabled={isLoading}>
          {isLoading ? tCommon("loading") : tCommon("login")}
        </AuthPrimaryButton>
      </form>

      <AuthFooterLink
        text={tAuth("noAccount")}
        linkText={tAuth("signUp")}
        onClick={() => router.push(`/${locale}/register`)}
      />
    </AuthCard>
  );
}
