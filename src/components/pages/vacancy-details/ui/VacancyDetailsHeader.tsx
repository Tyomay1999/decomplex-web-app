"use client";

type Props = {
  title: string;
  meta: string;
  onBack: () => void;
  backLabel: string;
};

export function VacancyDetailsHeader({ title, meta, onBack, backLabel }: Props) {
  return (
    <div className="modal-header border-color vacancy-details__header">
      <div className="vacancy-details__header-left">
        <h2 className="modal-title text-primary">{title}</h2>
        <p className="modal-subtitle text-secondary">{meta}</p>
      </div>

      <button
        className="modal-close text-secondary vacancy-details__back"
        onClick={onBack}
        type="button"
        aria-label={backLabel}
        title={backLabel}
      >
        <span className="vacancy-details__back-icon" aria-hidden="true" />
      </button>
    </div>
  );
}
