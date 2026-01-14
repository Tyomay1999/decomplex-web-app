"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/config";
import { defaultLocale, localeSet } from "@/i18n/config";

import { useRegisterCandidateMutation, useRegisterCompanyMutation } from "@/features/auth";
import { pushToast } from "@/features/notifications";
import { useAppDispatch } from "@/store/hooks";

import {
  AccountTypeToggle,
  AuthCard,
  AuthField,
  AuthFooterLink,
  AuthPrimaryButton,
  getAdminUrl,
} from "@/components/Auth";
import type { AccountType } from "@/components/Auth";

type Params = { locale?: string };

function toLocale(v: unknown): Locale {
  if (typeof v === "string" && localeSet.has(v as Locale)) return v as Locale;
  return defaultLocale;
}

export default function RegisterPage() {
  const tCommon = useTranslations("Common");
  const tAuth = useTranslations("Auth");

  const router = useRouter();
  const dispatch = useAppDispatch();

  const params = useParams<Params>();
  const locale = useMemo<Locale>(() => toLocale(params?.locale), [params?.locale]);

  const [accountType, setAccountType] = useState<AccountType>("candidate");

  const [registerCandidate, { isLoading: isCandidateLoading }] = useRegisterCandidateMutation();
  const [registerCompany, { isLoading: isCompanyLoading }] = useRegisterCompanyMutation();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isLoading = accountType === "candidate" ? isCandidateLoading : isCompanyLoading;

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      dispatch(pushToast({ message: tAuth("errors.fillEmailPassword"), kind: "error" }));
      return;
    }

    if (accountType === "candidate") {
      if (!firstName || !lastName) {
        dispatch(pushToast({ message: tAuth("errors.fillFirstLastName"), kind: "error" }));
        return;
      }

      try {
        await registerCandidate({
          firstName,
          lastName,
          email,
          password,
          language: locale,
        }).unwrap();

        router.replace("/", { locale, scroll: false });
      } catch {
        return;
      }

      return;
    }

    if (!companyName) {
      dispatch(pushToast({ message: tAuth("errors.fillCompanyName"), kind: "error" }));
      return;
    }

    try {
      await registerCompany({
        name: companyName,
        email,
        password,
        defaultLocale: locale,
        adminLanguage: locale,
      }).unwrap();

      window.location.assign(getAdminUrl());
    } catch {
      return;
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
              placeholder={tAuth("placeholders.firstName")}
              autoComplete="given-name"
              required
            />
            <AuthField
              id="reg-lastName"
              label={tAuth("lastName")}
              value={lastName}
              onChange={setLastName}
              placeholder={tAuth("placeholders.lastName")}
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
            placeholder={tAuth("placeholders.companyName")}
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
          placeholder={tAuth("placeholders.email")}
          required
          autoComplete="email"
        />

        <AuthField
          id="reg-password"
          label={tAuth("password")}
          type="password"
          value={password}
          onChange={setPassword}
          placeholder={tAuth("placeholders.password")}
          required
          autoComplete="new-password"
        />

        <AuthPrimaryButton disabled={isLoading}>
          {isLoading ? tCommon("loading") : tCommon("continue")}
        </AuthPrimaryButton>
      </form>

      <AuthFooterLink
        text={tAuth("haveAccount")}
        linkText={tAuth("logIn")}
        onClick={() => router.push("/login", { locale, scroll: false })}
      />
    </AuthCard>
  );
}
