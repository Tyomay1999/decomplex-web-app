"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { LANGS, Lang } from "./types";

type Props = {
  value: Lang;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onChange: (next: Lang) => void;
};

export function LanguageDropdown({ value, isOpen, onToggle, onClose, onChange }: Props) {
  const t = useTranslations("header");

  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (e: PointerEvent) => {
      const el = wrapRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) onClose();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <div className="lang-wrap" ref={wrapRef}>
      <button
        type="button"
        className="lang-trigger border-color text-primary bg-hover"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-label={t("language")}
      >
        {value.toUpperCase()}
        <span className={`lang-caret ${isOpen ? "open" : ""}`}>▾</span>
      </button>

      {isOpen && (
        <div className="lang-menu bg-surface border-color" role="menu">
          {LANGS.map((l) => (
            <button
              key={l}
              type="button"
              className={`lang-item ${l === value ? "active" : ""}`}
              onClick={() => onChange(l)}
              role="menuitem"
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
