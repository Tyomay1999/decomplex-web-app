"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { useGetVacancyByIdQuery } from "@/features/vacancies/vacanciesApi";
import { useAppSelector } from "@/store/hooks";
import { getAccessTokenFromCookie } from "@/lib/authCookies";
import { ApplyModal } from "@/features/applications/ui/ApplyModal";
import type { VacancyEntityDto } from "@/features/vacancies/types";

type Props = { id: string; locale: string };

type RichBlock =
  | { type: "p"; text: string }
  | { type: "h"; text: string }
  | { type: "ul"; items: string[] };

function normalizeLines(text: string): string[] {
  return text.replace(/\r\n/g, "\n").replace(/\t/g, " ").split("\n");
}

function isBullet(line: string): boolean {
  const t = line.trim();
  return t.startsWith("- ") || t.startsWith("• ") || t.startsWith("* ");
}

function cleanBullet(line: string): string {
  return line.trim().replace(/^(-|\*|•)\s+/, "");
}

function isHeading(line: string): boolean {
  const t = line.trim();
  if (!t) return false;
  if (t.endsWith(":")) return true;
  return /^[A-ZА-Я][A-Za-zА-Яа-я0-9\s/&-]{2,}$/.test(t);
}

function toRichBlocks(text: string): RichBlock[] {
  const lines = normalizeLines(text);

  const blocks: RichBlock[] = [];
  let paragraphBuf: string[] = [];
  let listBuf: string[] = [];

  const flushParagraph = () => {
    const p = paragraphBuf.join(" ").trim();
    if (p) blocks.push({ type: "p", text: p });
    paragraphBuf = [];
  };

  const flushList = () => {
    if (listBuf.length) blocks.push({ type: "ul", items: [...listBuf] });
    listBuf = [];
  };

  for (const raw of lines) {
    const line = raw.trim();

    if (!line) {
      flushList();
      flushParagraph();
      continue;
    }

    if (isBullet(line)) {
      flushParagraph();
      listBuf.push(cleanBullet(line));
      continue;
    }

    if (isHeading(line) && line.length <= 40) {
      flushList();
      flushParagraph();
      blocks.push({ type: "h", text: line.replace(/:$/, "") });
      continue;
    }

    flushList();
    paragraphBuf.push(line);
  }

  flushList();
  flushParagraph();

  return blocks;
}

function DescriptionRichText({ text }: { text: string }) {
  const blocks = toRichBlocks(text);

  return (
    <div className="rich-text">
      {blocks.map((b, idx) => {
        if (b.type === "h") {
          return (
            <div key={idx} className="rich-text__h">
              {b.text}
            </div>
          );
        }

        if (b.type === "ul") {
          return (
            <ul key={idx} className="rich-text__ul">
              {b.items.map((it, i) => (
                <li key={i} className="rich-text__li">
                  {it}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={idx} className="rich-text__p">
            {b.text}
          </p>
        );
      })}
    </div>
  );
}

export function VacancyDetailsClient({ id, locale }: Props) {
  const t = useTranslations("vacancy");
  const router = useRouter();

  const auth = useAppSelector((s) => s.auth);
  const isAuthed = Boolean(auth.accessToken || getAccessTokenFromCookie());
  const isCandidate = auth.user?.userType === "candidate" || auth.user?.role === "candidate";

  const { data: vacancy, isLoading, isError } = useGetVacancyByIdQuery(id);
  const [isApplyOpen, setIsApplyOpen] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    if (!isApplyOpen) return;

    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyPaddingRight = body.style.paddingRight;

    const scrollbarWidth = window.innerWidth - html.clientWidth;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.paddingRight = prevBodyPaddingRight;
    };
  }, [isApplyOpen]);

  const meta = useMemo(() => {
    if (!vacancy) return "";
    const parts = [
      vacancy.location ? vacancy.location : t("unknownLocation"),
      vacancy.jobType,
      vacancy.status,
    ].filter(Boolean);
    return parts.join(" • ");
  }, [vacancy, t]);

  const onApplyClick = () => {
    const detailUrl = `/${locale}/vacancies/${id}`;

    if (!isAuthed) {
      router.push(`/${locale}/login?redirect=${encodeURIComponent(detailUrl)}`);
      return;
    }
    if (!isCandidate) return;

    setIsApplyOpen(true);
  };

  if (isLoading)
    return (
      <div className="text-secondary" style={{ padding: 24 }}>
        {t("loading")}
      </div>
    );

  if (isError || !vacancy)
    return (
      <div className="text-secondary" style={{ padding: 24 }}>
        {t("loadError")}
      </div>
    );

  const v: VacancyEntityDto = vacancy;

  return (
    <div className="page-content active">
      <section className="vacancies-section" style={{ paddingTop: 40 }}>
        <div className="modal bg-surface" style={{ maxWidth: 900, margin: "0 auto" }}>
          <div className="modal-header border-color">
            <div style={{ flex: 1 }}>
              <h2 className="modal-title text-primary">{v.title}</h2>
              <p className="modal-subtitle text-secondary">{meta}</p>
            </div>

            <button
              className="modal-close text-secondary"
              onClick={() => router.back()}
              type="button"
              aria-label={t("back")}
              title={t("back")}
            >
              ←
            </button>
          </div>

          <div className="modal-content">
            <div className="modal-section">
              <h3 className="modal-section-title text-tertiary">{t("description")}</h3>
              <div className="modal-section-content text-primary">
                <DescriptionRichText text={v.description} />
              </div>
            </div>

            <div className="modal-section">
              <h3 className="modal-section-title text-tertiary">{t("details")}</h3>
              <p className="modal-section-content text-primary">
                {v.salaryFrom || v.salaryTo
                  ? `${t("salary")}: ${v.salaryFrom ?? "—"} - ${v.salaryTo ?? "—"}`
                  : t("salaryUnknown")}
              </p>
            </div>
          </div>

          <div className="modal-footer border-color">
            <button
              className="btn btn-outline border-color text-primary"
              type="button"
              onClick={() => router.back()}
            >
              {t("close")}
            </button>

            <button
              className="btn"
              style={{ backgroundColor: "#3B82F6", color: "#FFFFFF" }}
              type="button"
              onClick={onApplyClick}
              disabled={isAuthed && !isCandidate}
              title={isAuthed && !isCandidate ? t("applyOnlyCandidate") : undefined}
            >
              {t("apply")}
            </button>
          </div>
        </div>
      </section>

      <ApplyModal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        vacancyId={id}
        vacancyTitle={v.title}
      />
    </div>
  );
}
