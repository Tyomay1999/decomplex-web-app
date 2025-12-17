"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";

import { AuthCard } from "../../../../components/Auth/AuthCard";
import { AuthField } from "../../../../components/Auth/AuthField";
import { AuthPrimaryButton } from "../../../../components/Auth/AuthPrimaryButton";
import { AuthFooterLink } from "../../../../components/Auth/AuthFooterLink";
import { AccountTypeToggle } from "../../../../components/Auth/AccountTypeToggle";

type Locale = "en" | "hy" | "ru";
type AccountType = "candidate" | "company";

export default function RegisterPage() {
  const tCommon = useTranslations("Common");
  const tAuth = useTranslations("Auth");

  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const locale = (params?.locale ?? "en") as Locale;

  const [accountType, setAccountType] = useState<AccountType>("candidate");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    router.push(`/${locale}/login`);
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
            />
            <AuthField
              id="reg-lastName"
              label={tAuth("lastName")}
              value={lastName}
              onChange={setLastName}
              placeholder="Doe"
              autoComplete="family-name"
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

        <AuthPrimaryButton>{tCommon("continue")}</AuthPrimaryButton>
      </form>

      <AuthFooterLink
        text={tAuth("haveAccount")}
        linkText={tAuth("logIn")}
        onClick={() => router.push(`/${locale}/login`)}
      />
    </AuthCard>
  );
}
