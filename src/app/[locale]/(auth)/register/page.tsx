"use client";

import { FormEvent, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";

import { AuthCard } from "../../../../components/Auth/AuthCard";
import { AuthField } from "../../../../components/Auth/AuthField";
import { AuthPrimaryButton } from "../../../../components/Auth/AuthPrimaryButton";
import { AuthFooterLink } from "../../../../components/Auth/AuthFooterLink";
import { AccountTypeToggle } from "../../../../components/Auth/AccountTypeToggle";

import {
  useRegisterCandidateMutation,
  useRegisterCompanyMutation,
} from "../../../../features/auth/authApi";

type Locale = "en" | "hy" | "ru";
type AccountType = "candidate" | "company";
type BackendLocale = "am" | "ru" | "en";

function mapUiLocaleToBackend(ui: Locale): BackendLocale {
  if (ui === "hy") return "am";
  return ui;
}

function getAdminUrl(locale: Locale): string {
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return `http://localhost:5173/${locale}`;
  }
  return `https://decomplex-admin.tyomay.dev/${locale}`;
}

export default function RegisterPage() {
  const tCommon = useTranslations("Common");
  const tAuth = useTranslations("Auth");

  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const locale = (params?.locale ?? "en") as Locale;

  const backendLocale = mapUiLocaleToBackend(locale);

  const [accountType, setAccountType] = useState<AccountType>("candidate");

  const [registerCandidate, { isLoading: isCandidateLoading, error: candidateError }] =
    useRegisterCandidateMutation();

  const [registerCompany, { isLoading: isCompanyLoading, error: companyError }] =
    useRegisterCompanyMutation();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [localError, setLocalError] = useState<string | null>(null);

  const errorText = useMemo(() => {
    if (localError) return localError;

    if (accountType === "candidate" && candidateError) {
      return "Registration failed. Please check your data and try again.";
    }
    if (accountType === "company" && companyError) {
      return "Company registration failed. Please check your data and try again.";
    }
    return null;
  }, [localError, candidateError, companyError, accountType]);

  const isLoading = accountType === "candidate" ? isCandidateLoading : isCompanyLoading;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password) {
      setLocalError("Please fill email and password.");
      return;
    }

    if (accountType === "candidate") {
      if (!firstName || !lastName) {
        setLocalError("Please fill first name and last name.");
        return;
      }

      try {
        await registerCandidate({
          firstName,
          lastName,
          email,
          password,
          language: backendLocale,
        }).unwrap();

        router.replace(`/${locale}`);
      } catch {
        // handled via errorText
      }

      return;
    }

    if (!companyName) {
      setLocalError("Please fill company name.");
      return;
    }

    try {
      await registerCompany({
        name: companyName,
        email,
        password,
        defaultLocale: backendLocale,
        adminLanguage: backendLocale,
      }).unwrap();

      window.location.assign(getAdminUrl(locale));
    } catch {
      // handled via errorText
    }
  };

  return (
    <AuthCard title={tAuth("createAccount")} subtitle={tAuth("subtitleRegister")}>
      <form className="auth-form" onSubmit={onSubmit}>
        <AccountTypeToggle
          label={tAuth("accountType")}
          value={accountType}
          onChange={setAccountType}
          candidateText={tAuth("candidate")}
          companyText={tAuth("company")}
        />

        {accountType === "candidate" ? (
          <div className="form-row">
            <AuthField
              id="reg-firstName"
              label={tAuth("firstName")}
              value={firstName}
              onChange={setFirstName}
              placeholder="John"
              autoComplete="given-name"
              required
            />
            <AuthField
              id="reg-lastName"
              label={tAuth("lastName")}
              value={lastName}
              onChange={setLastName}
              placeholder="Doe"
              autoComplete="family-name"
              required
            />
          </div>
        ) : (
          <AuthField
            id="reg-companyName"
            label={tAuth("companyName")}
            value={companyName}
            onChange={setCompanyName}
            placeholder="Acme Corp"
            autoComplete="organization"
            required
          />
        )}

        <AuthField
          id="reg-email"
          label={tAuth("email")}
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          required
          autoComplete="email"
        />

        <AuthField
          id="reg-password"
          label={tAuth("password")}
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          required
          autoComplete="new-password"
        />

        {errorText ? <div style={{ color: "#EF4444", fontSize: 14 }}>{errorText}</div> : null}

        <AuthPrimaryButton disabled={isLoading}>
          {isLoading ? tCommon("loading") : tCommon("continue")}
        </AuthPrimaryButton>
      </form>

      <AuthFooterLink
        text={tAuth("haveAccount")}
        linkText={tAuth("logIn")}
        onClick={() => router.push(`/${locale}/login`)}
      />
    </AuthCard>
  );
}
