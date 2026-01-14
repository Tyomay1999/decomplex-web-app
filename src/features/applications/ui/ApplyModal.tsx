"use client";

import { useState } from "react";
import type { MouseEvent } from "react";
import { useTranslations } from "next-intl";
import { useApplyToVacancyMutation } from "@/features/vacancies";
import { useAppDispatch } from "../../../store/hooks";
import { pushToast } from "../../notifications/notificationsSlice";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  vacancyId: string;
  vacancyTitle?: string;
};

export function ApplyModal({ isOpen, onClose, vacancyId, vacancyTitle }: Props) {
  const t = useTranslations("apply");
  const dispatch = useAppDispatch();
  const [coverLetter, setCoverLetter] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [apply, { isLoading }] = useApplyToVacancyMutation();

  const onOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    if (isLoading) return null;
    if ((e.target as HTMLElement).classList.contains("modal-overlay")) onClose();
  };

  const onSubmit = async () => {
    if (!file) return;

    try {
      await apply({ vacancyId, file, coverLetter: coverLetter.trim() || undefined }).unwrap();
      dispatch(pushToast({ kind: "success", message: t("successToast") }));
      onClose();
    } catch {
      // handled by notifications
    }
  };

  const onRemoveFile = () => setFile(null);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onOverlayClick}>
      <div className="modal bg-surface" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header border-color">
          <div style={{ flex: 1 }}>
            <h2 className="modal-title text-primary">{t("title")}</h2>
            <p className="modal-subtitle text-secondary">
              {vacancyTitle ? vacancyTitle : t("subtitleFallback")}
            </p>
          </div>

          <button
            type="button"
            className="modal-close text-secondary"
            disabled={isLoading}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="modal-content">
          <form className="apply-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label className="form-label text-primary" htmlFor="cover-letter">
                {t("coverLetterLabel")}
              </label>

              <textarea
                id="cover-letter"
                className="form-textarea border-color text-primary"
                placeholder={t("coverLetterPlaceholder")}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
              />

              <span className="form-hint text-secondary">{t("coverLetterHint")}</span>
            </div>

            <div className="form-group">
              <label className="form-label text-primary">{t("cvLabel")}</label>

              <div className="file-upload-wrapper">
                <input
                  type="file"
                  id="resume-upload"
                  className="file-upload-input"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />

                {!file ? (
                  <label
                    htmlFor="resume-upload"
                    className="file-upload-label border-color text-secondary"
                  >
                    <span className="file-upload-icon">📎</span>
                    <span className="file-upload-text">{t("cvUploadText")}</span>
                  </label>
                ) : (
                  <div className="file-selected border-color text-primary">
                    <span className="file-name">
                      <span>📄</span>
                      <span>{file.name}</span>
                    </span>
                    <button
                      type="button"
                      disabled={isLoading}
                      className="file-remove text-secondary"
                      onClick={onRemoveFile}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              <span className="form-hint text-secondary">{t("cvHint")}</span>
            </div>
          </form>
        </div>

        <div className="modal-footer border-color">
          <button
            className="btn btn-outline border-color text-primary"
            onClick={onClose}
            disabled={isLoading}
            type="button"
          >
            {t("cancel")}
          </button>

          <button
            className="btn btn-primary"
            style={{ backgroundColor: "#3B82F6", color: "#FFFFFF" }}
            onClick={onSubmit}
            type="button"
            disabled={isLoading || !file}
            id="submit-application-btn"
          >
            {isLoading ? <span className="spinner" /> : t("submit")}
          </button>
        </div>
      </div>
    </div>
  );
}
