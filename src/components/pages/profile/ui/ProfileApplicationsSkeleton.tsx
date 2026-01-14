"use client";

export function ProfileApplicationsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="applications-list" aria-busy="true" aria-label="Loading applications">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`app-sk-${i}`}
          className="application-item application-item--skeleton border-color"
        >
          <div className="sk-line app-sk__title" />
          <div className="sk-line app-sk__company" />
          <div className="app-sk__meta">
            <span className="sk-chip app-sk__chip" />
            <span className="sk-chip app-sk__chip" />
          </div>

          <div className="app-sk__bottom">
            <div className="sk-line app-sk__date" />
            <span className="sk-chip app-sk__status" />
          </div>

          <div className="app-sk__shimmer" aria-hidden="true" />
        </div>
      ))}
    </div>
  );
}
