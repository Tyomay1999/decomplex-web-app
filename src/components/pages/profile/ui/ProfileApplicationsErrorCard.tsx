"use client";

type Props = {
  title: string;
  body?: string;
  retryLabel: string;
  onRetry: () => void;
};

export function ProfileApplicationsErrorCard({ title, body, retryLabel, onRetry }: Props) {
  return (
    <div className="profile-error-card bg-surface border-color" role="alert">
      <div className="profile-error-card__icon" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 9v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path
            d="M10.3 4.3 2.6 18a2 2 0 0 0 1.8 3h15.2a2 2 0 0 0 1.8-3L13.7 4.3a2 2 0 0 0-3.4 0Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="profile-error-card__content">
        <div className="profile-error-card__title text-primary">{title}</div>
        {body ? <div className="profile-error-card__body text-secondary">{body}</div> : null}

        <div className="profile-error-card__actions">
          <button type="button" className="btn btn-primary" onClick={onRetry}>
            {retryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
