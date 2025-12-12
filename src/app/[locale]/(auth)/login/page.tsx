"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useLoginMutation, useLogoutMutation } from "../../../../features/auth/authApi";
import { useAppSelector } from "../../../../store/hooks";
import { LanguageSwitcher } from "../../../../components/LanguageSwitcher";

export default function LoginPage() {
  const tCommon = useTranslations("Common");
  const tAuth = useTranslations("Auth");

  const params = useParams<{ locale: string }>();
  const locale = (params?.locale ?? "en") as "en" | "hy" | "ru";

  const [login] = useLoginMutation();
  const [logout] = useLogoutMutation();
  const auth = useAppSelector((s) => s.auth);

  return (
    <div style={{ padding: 24 }}>
      <LanguageSwitcher />
      <h1>{tAuth("title")}</h1>

      <button
        onClick={() =>
          login({
            email: "john.doe@example.com",
            password: "Candidate123!",
            rememberUser: true,
            language: locale,
          })
        }
      >
        {tCommon("login")}
      </button>

      <button style={{ marginLeft: 12 }} onClick={() => logout()}>
        {tCommon("logout")}
      </button>

      <pre style={{ marginTop: 12 }}>
        {JSON.stringify({ isLoggedIn: Boolean(auth.accessToken), user: auth.user }, null, 2)}
      </pre>
    </div>
  );
}
