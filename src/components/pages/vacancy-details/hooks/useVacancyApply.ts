"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { useAppSelector } from "@/store/hooks";
import { getAccessTokenFromCookie } from "@/lib/authCookies";

type Params = {
  vacancyId: string;
  locale: string;
};

export function useVacancyApply({ vacancyId, locale }: Params) {
  const t = useTranslations("vacancy");
  const router = useRouter();
  const auth = useAppSelector((s) => s.auth);

  const isAuthed = Boolean(auth.accessToken || getAccessTokenFromCookie());
  const isCandidate = auth.user?.userType === "candidate" || auth.user?.role === "candidate";

  const applyDisabled = Boolean(isAuthed && !isCandidate);

  const applyTitle = useMemo(() => {
    if (!applyDisabled) return undefined;
    return t("applyOnlyCandidate");
  }, [applyDisabled, t]);

  const openApply = () => {
    const detailUrl = `/${locale}/vacancies/${vacancyId}`;

    if (!isAuthed) {
      router.push(`/${locale}/login?redirect=${encodeURIComponent(detailUrl)}`);
      return false;
    }

    if (!isCandidate) return false;

    return true;
  };

  return { applyDisabled, applyTitle, openApply };
}
