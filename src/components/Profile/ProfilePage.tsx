"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

import { ProfileInfoCard } from "./components/ProfileInfoCard";
import { ProfileApplicationsCard } from "./components/ProfileApplicationsCard";
import { mockProfile, mockApplications } from "./mock";

export type ApplicationStatus = "pending" | "approved" | "rejected";

export type ApplicationMock = {
  id: string;
  vacancyTitle: string;
  companyName: string;
  appliedDate: string;
  status: ApplicationStatus;
};

export type ProfileMock = {
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  userType: "candidate" | "company";
  memberSince: string;
};

export function ProfilePage() {
  const t = useTranslations("profile");

  const profile = mockProfile;
  const applications = mockApplications;

  const fullName = useMemo(() => {
    const name = `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim();
    return name || t("fallbackName");
  }, [profile.firstName, profile.lastName, t]);

  const avatarText = profile.userType === "company" ? "🏢" : "👤";

  return (
    <div className="page-content active">
      <div className="profile-container">
        <ProfileInfoCard
          title={t("title")}
          avatarText={avatarText}
          fullName={fullName}
          email={profile.email}
          accountTypeLabel={
            profile.userType === "candidate" ? t("accountTypeCandidate") : t("accountTypeCompany")
          }
          memberSinceLabel={t("memberSinceValue", {
            date: new Date(profile.memberSince).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
            }),
          })}
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
          applications={applications}
          statusLabels={{
            pending: t("statusPending"),
            approved: t("statusApproved"),
            rejected: t("statusRejected"),
          }}
          appliedLabel={(dateStr) => t("appliedOn", { date: dateStr })}
        />
      </div>
    </div>
  );
}
