"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import type { Lang } from "../types";
import { LANGS } from "../types";

function isLang(v: unknown): v is Lang {
  return typeof v === "string" && (LANGS as readonly string[]).includes(v);
}

export function useHeaderLocale(): Lang {
  const params = useParams<{ locale?: string }>();

  return useMemo(() => {
    const raw = params?.locale;
    return isLang(raw) ? raw : "en";
  }, [params?.locale]);
}
