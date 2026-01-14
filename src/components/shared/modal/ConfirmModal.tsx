"use client";

import type { MouseEvent, ReactNode } from "react";

type Props = {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
  isLoading?: boolean;

  onConfirm: () => void;
  onClose: () => void;

  icon?: ReactNode;
};

export function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel,
  isLoading,
  onConfirm,
  onClose,
  icon,
}: Props) {
  if (!isOpen) return null;

  const onOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    if (isLoading) return;
    if ((e.target as HTMLElement).classList.contains("modal-overlay")) onClose();
  };

  return (
    <div className="modal-overlay" onClick={onOverlayClick}>
      <div
        className="modal bg-surface"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header border-color">
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
            {icon ? <div className="confirm-icon">{icon}</div> : null}
            <div>
              <h2 className="modal-title text-primary">{title}</h2>
              {description ? <p className="modal-subtitle text-secondary">{description}</p> : null}
            </div>
          </div>

          <button
            type="button"
            className="modal-close text-secondary"
            disabled={Boolean(isLoading)}
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="modal-footer border-color">
          <button
            type="button"
            className="btn btn-outline border-color text-primary"
            disabled={Boolean(isLoading)}
            onClick={onClose}
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            className="btn btn-primary"
            disabled={Boolean(isLoading)}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
