"use client";

type Props = {
    title: string;
    avatarText: string;
    fullName: string;
    email: string;
    accountTypeLabel: string;
    memberSinceLabel: string;
    labels: {
        accountInfoTitle: string;
        accountType: string;
        email: string;
        memberSince: string;
    };
};

export function ProfileInfoCard({
                                    avatarText,
                                    fullName,
                                    email,
                                    accountTypeLabel,
                                    memberSinceLabel,
                                    labels,
                                }: Props) {
    return (
        <div className="profile-card bg-surface border-color">
            <div className="profile-header border-color">
                <div className="profile-avatar bg-surface border-color">
                    <span>{avatarText}</span>
                </div>

                <div className="profile-info">
                    <h1 className="profile-name text-primary">{fullName}</h1>
                    <p className="profile-email text-secondary">{email}</p>
                </div>
            </div>

            <div className="profile-section">
                <h2 className="profile-section-title text-primary">{labels.accountInfoTitle}</h2>

                <div className="profile-detail border-color">
                    <span className="profile-label text-secondary">{labels.accountType}</span>
                    <span className="profile-value text-primary">{accountTypeLabel}</span>
                </div>

                <div className="profile-detail border-color">
                    <span className="profile-label text-secondary">{labels.email}</span>
                    <span className="profile-value text-primary">{email}</span>
                </div>

                <div className="profile-detail border-color">
                    <span className="profile-label text-secondary">{labels.memberSince}</span>
                    <span className="profile-value text-primary">{memberSinceLabel}</span>
                </div>
            </div>
        </div>
    );
}
