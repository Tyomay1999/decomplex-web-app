"use client";

import { useAppSelector } from "../../../../store/hooks";

type Props = {
  onClose: () => void;
  closeLabel: string;

  applyLabel: string;
  applyDisabled: boolean;
  applyTitle?: string;
  onApply: () => void;
};

export function VacancyDetailsFooter({
  onClose,
  closeLabel,
  applyLabel,
  applyDisabled,
  applyTitle,
  onApply,
}: Props) {
  const user = useAppSelector((s) => s.auth.user);

  const disabled = user ? applyDisabled : true;
  return (
    <div className="modal-footer border-color vacancy-details__footer">
      <button className="btn btn-outline border-color text-primary" type="button" onClick={onClose}>
        {closeLabel}
      </button>

      <button
        className="btn btn-primary"
        onClick={onApply}
        aria-disabled={applyDisabled}
        disabled={disabled}
        title={applyTitle}
      >
        {applyLabel}
      </button>
    </div>
  );
}
