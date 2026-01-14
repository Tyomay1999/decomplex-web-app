"use client";

import { useEffect, useMemo, useRef } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { LANGS } from "../types";
import type { Lang } from "../types";

type Props = {
  value: Lang;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onChange?: (next: Lang) => void;
};

function buildNextLocalePath(pathname: string, nextLocale: Lang): string {
  const parts = pathname.split("/").filter(Boolean);
  const first = parts[0];

  const isKnownLocale = first && (LANGS as readonly string[]).includes(first);
  const rest = isKnownLocale ? parts.slice(1) : parts;

  return `/${nextLocale}/${rest.join("/")}`.replace(/\/+$/, "") || `/${nextLocale}`;
}

export function LanguageDropdown({ value, isOpen, onToggle, onClose, onChange }: Props) {
  const t = useTranslations("header");
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentQuery = useMemo(() => {
    const qs = searchParams?.toString();
    return qs ? `?${qs}` : "";
  }, [searchParams]);

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

  const handleChange = (next: Lang) => {
    if (next === value) {
      onClose();
      return;
    }
    const nextPath = buildNextLocalePath(pathname || "/", next) + currentQuery;
    document.cookie = `dc_locale=${next}; path=/; samesite=lax`;

    router.replace(nextPath);
    onChange?.(next);

    onClose();
  };

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
              onClick={() => handleChange(l)}
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
