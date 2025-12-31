"use client";

import type { ApplicationMock } from "../ProfilePage";

type Props = {
  title: string;
  emptyText: string;
  applications: ApplicationMock[];
  statusLabels: Record<ApplicationMock["status"], string>;
  appliedLabel: (dateStr: string) => string;
};

export function ProfileApplicationsCard({
  title,
  emptyText,
  applications,
  statusLabels,
  appliedLabel,
}: Props) {
  const hasApps = applications.length > 0;

  return (
    <div className="profile-card bg-surface border-color">
      <div className="profile-section">
        <h2 className="profile-section-title text-primary">{title}</h2>

        {hasApps ? (
          <div className="applications-list">
            {applications.map((app) => {
              const date = new Date(app.appliedDate);
              const dateStr = date.toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              });

              return (
                <div key={app.id} className="application-item border-color">
                  <div className="application-title text-primary">{app.vacancyTitle}</div>
                  <div className="application-company text-secondary">{app.companyName}</div>
                  <div className="application-date text-tertiary">{appliedLabel(dateStr)}</div>

                  <span className={`application-status status-${app.status}`}>
                    {statusLabels[app.status]}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <div className="empty-text text-secondary">{emptyText}</div>
          </div>
        )}
      </div>
    </div>
  );
}
