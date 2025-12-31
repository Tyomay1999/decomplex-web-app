"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useApplyToVacancyMutation } from "@/features/vacancies/vacanciesApi";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  vacancyId: string;
  vacancyTitle?: string;
};

export function ApplyModal({ isOpen, onClose, vacancyId, vacancyTitle }: Props) {
  const t = useTranslations("apply");

  const [coverLetter, setCoverLetter] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [apply, { isLoading, error, isSuccess }] = useApplyToVacancyMutation();

  const errorText = useMemo(() => {
    if (!error) return null;
    return t("submitError");
  }, [error, t]);

  const onOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).classList.contains("modal-overlay")) onClose();
  };

  const onSubmit = async () => {
    if (!file) return;

    try {
      await apply({ vacancyId, file, coverLetter: coverLetter.trim() || undefined }).unwrap();
      onClose();
    } catch {
      // handled by errorText
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

          <button className="modal-close text-secondary" onClick={onClose} type="button">
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

            {errorText ? <div style={{ color: "#EF4444", fontSize: 14 }}>{errorText}</div> : null}
            {isSuccess ? <div className="text-secondary">{t("success")}</div> : null}
          </form>
        </div>

        <div className="modal-footer border-color">
          <button
            className="btn btn-outline border-color text-primary"
            onClick={onClose}
            type="button"
          >
            {t("cancel")}
          </button>

          <button
            className="btn"
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
