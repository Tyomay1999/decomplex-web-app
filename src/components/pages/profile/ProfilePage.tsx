"use client";

import { useTranslations } from "next-intl";
import { useMeQuery } from "@/features/auth/authApi";
import { useAppSelector } from "@/store/hooks";
import { useMyApplicationsInfinite } from "@/features/applications/hooks/useMyApplicationsInfinite";

import { ProfileInfoCard, ProfileApplicationsCard } from "./ui";
import { useUiProfile } from "./hooks";

export function ProfilePage() {
  const t = useTranslations("profile");

  const { data } = useMeQuery();
  const authUser = useAppSelector((s) => s.auth.user);

  const profile = useUiProfile(data?.user, authUser, t("fallbackName"));

  const { items, isInitialLoading, isError, hasMore, loadMore, reload, isFetching } =
    useMyApplicationsInfinite();

  const memberSinceLabel = profile.memberSinceIso
    ? t("memberSinceValue", {
        date: new Date(profile.memberSinceIso).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
        }),
      })
    : t("memberSinceUnknown");

  const avatarText = profile.userType === "company" ? t("avatarCompany") : t("avatarCandidate");

  return (
    <div className="page-content active">
      <div className="profile-container">
        <ProfileInfoCard
          avatarText={avatarText}
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
          isLoading={isInitialLoading}
          isError={isError}
          isFetchingMore={isFetching && items.length > 0}
          hasMore={hasMore}
          onLoadMore={loadMore}
          onRetry={reload}
          labels={{
            searchPlaceholder: t("applicationsSearchPlaceholder"),
            loadMore: t("loadMore"),
            loading: t("loading"),
            retry: t("retry"),
            filterAll: t("filterAll"),
            filterReset: t("filterReset"),
            filterLocation: t("filterLocation"),
            filterJobType: t("filterJobType"),
            loadErrorTitle: t("loadErrorTitle"),
            loadErrorBody: t("loadErrorBody"),
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
