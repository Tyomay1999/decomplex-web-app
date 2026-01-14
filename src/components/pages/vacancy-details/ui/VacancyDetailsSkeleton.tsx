"use client";

export function VacancyDetailsSkeleton() {
  return (
    <div className="vacancy-details__container">
      <div className="vacancy-details-skeleton bg-surface border-color" aria-busy="true">
        <div className="vds__header">
          <div className="vds__title sk-line" />
          <div className="vds__meta sk-line" />

          <div className="vds__back sk-chip" />
        </div>

        <div className="vds__divider border-color" />

        <div className="vds__body">
          <div className="vds__section-title sk-line" />

          <div className="vds__para">
            <div className="sk-line vds__line-1" />
            <div className="sk-line vds__line-2" />
            <div className="sk-line vds__line-3" />
            <div className="sk-line vds__line-4" />
          </div>

          <div className="vds__section-title sk-line" style={{ marginTop: 20 }} />

          <div className="vds__grid">
            <div className="vds__row">
              <div className="sk-line vds__label" />
              <div className="sk-line vds__value" />
            </div>
            <div className="vds__row">
              <div className="sk-line vds__label" />
              <div className="sk-line vds__value" />
            </div>
            <div className="vds__row">
              <div className="sk-line vds__label" />
              <div className="sk-line vds__value" />
            </div>
          </div>
        </div>

        <div className="vds__divider border-color" />

        <div className="vds__footer">
          <div className="sk-chip vds__btn" />
          <div className="sk-chip vds__btn vds__btn-primary" />
        </div>

        <div className="vds__shimmer" aria-hidden="true" />
      </div>
    </div>
  );
}
