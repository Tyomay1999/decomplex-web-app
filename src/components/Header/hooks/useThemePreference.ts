"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";

export type UiTheme = "light" | "dark";

const STORAGE_KEY = "ui-theme";

function getSystemTheme(): UiTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function readSavedTheme(): UiTheme | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}

function applyTheme(theme: UiTheme) {
  const html = document.documentElement;
  const body = document.body;

  html.classList.remove("light", "dark");
  html.classList.add(theme);

  body.classList.remove("light", "dark");
  body.classList.add(theme);
}

export function useThemePreference() {
  const [theme, setTheme] = useState<UiTheme>("light");
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    const saved = readSavedTheme();
    const next = saved ?? getSystemTheme();
    setTheme(next);
    applyTheme(next);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    applyTheme(theme);

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme, mounted]);

  useEffect(() => {
    if (!mounted) return;

    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      const v = e.newValue;
      if (v === "light" || v === "dark") setTheme(v);
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [mounted]);

  const toggleTheme = useCallback(() => {
    setTheme((p) => (p === "light" ? "dark" : "light"));
  }, []);

  return { theme, mounted, toggleTheme, setTheme };
}
