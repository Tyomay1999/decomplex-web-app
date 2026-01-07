"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

import { ProfileInfoCard } from "./components/ProfileInfoCard";
import { ProfileApplicationsCard } from "./components/ProfileApplicationsCard";
import { useMyApplicationsInfinite } from "@/features/applications/hooks/useMyApplicationsInfinite";
import { useCurrentQuery } from "@/features/auth/authApi";
import { useAppSelector } from "@/store/hooks";

type UserLike = Record<string, unknown>;

type UiProfile = {
  fullName: string;
  email: string;
  userType: "candidate" | "company";
  memberSince: string | null;
};

function isRecord(v: unknown): v is UserLike {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function getStr(obj: unknown, key: string): string | null {
  if (!isRecord(obj)) return null;
  const v = obj[key];
  return typeof v === "string" && v.trim() ? v : null;
}

function buildUiProfile(primary: unknown, fallback: unknown, fallbackName: string): UiProfile {
  const firstName = getStr(primary, "firstName") ?? getStr(fallback, "firstName");
  const lastName = getStr(primary, "lastName") ?? getStr(fallback, "lastName");

  const nameFromSingle = getStr(primary, "name") ?? getStr(fallback, "name");

  const fullName = `${firstName ?? ""} ${lastName ?? ""}`.trim() || nameFromSingle || fallbackName;

  const email = getStr(primary, "email") ?? getStr(fallback, "email") ?? "";

  const userTypeRaw = getStr(primary, "userType") ?? getStr(fallback, "userType");
  const userType: UiProfile["userType"] = userTypeRaw === "company" ? "company" : "candidate";

  const memberSince =
    getStr(primary, "createdAt") ??
    getStr(fallback, "createdAt") ??
    getStr(primary, "registeredAt") ??
    getStr(fallback, "registeredAt") ??
    null;

  return { fullName, email, userType, memberSince };
}

export function ProfilePage() {
  const t = useTranslations("profile");

  const { data } = useCurrentQuery();
  const authUser = useAppSelector((s) => s.auth.user);

  const profile = useMemo(
    () => buildUiProfile(data?.user, authUser, t("fallbackName")),
    [data?.user, authUser, t],
  );

  const { items, isLoading, isError, hasMore, loadMore, refetch, isFetching } =
    useMyApplicationsInfinite({ limit: 20 });

  const memberSinceLabel = profile.memberSince
    ? t("memberSinceValue", {
        date: new Date(profile.memberSince).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
        }),
      })
    : t("memberSinceUnknown");

  return (
    <div className="page-content active">
      <div className="profile-container">
        <ProfileInfoCard
          title={t("title")}
          avatarText={profile.userType === "company" ? "🏢" : "👤"}
          fullName={profile.fullName}
          email={profile.email || t("valueUnknown")}
          accountTypeLabel={
            profile.userType === "candidate" ? t("accountTypeCandidate") : t("accountTypeCompany")
          }
          memberSinceLabel={memberSinceLabel}
          labels={{
            accountType: t("accountTypeLabel"),
            email: t("emailLabel"),
            memberSince: t("memberSinceLabel"),
            accountInfoTitle: t("accountInfoTitle"),
          }}
        />

        <ProfileApplicationsCard
          title={t("applicationsTitle")}
          emptyText={t("applicationsEmpty")}
          applications={items}
          isLoading={isLoading}
          isError={isError}
          isFetchingMore={isFetching && items.length > 0}
          hasMore={hasMore}
          onLoadMore={loadMore}
          onRetry={refetch}
          labels={{
            searchPlaceholder: t("applicationsSearchPlaceholder"),
            loadMore: t("loadMore"),
            loading: t("loading"),
            retry: t("retry"),
            filterAll: t("filterAll"),
            filterReset: t("filterReset"),
            filterLocation: t("filterLocation"),
            filterJobType: t("filterJobType"),
          }}
          statusLabels={{
            applied: t("statusApplied"),
            pending: t("statusPending"),
            reviewing: t("statusReviewing"),
            approved: t("statusApproved"),
            rejected: t("statusRejected"),
            accepted: t("statusAccepted"),
            canceled: t("statusCanceled"),
            withdrawn: t("statusWithdrawn"),
            unknown: t("statusUnknown"),
          }}
          appliedLabel={(dateStr) => t("appliedOn", { date: dateStr })}
        />
      </div>
    </div>
  );
}
