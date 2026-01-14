"use client";

import { useCallback, useState } from "react";

export function useHeaderNavState() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const toggleMobile = useCallback(() => setMobileOpen((v) => !v), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const toggleLang = useCallback(() => setLangOpen((v) => !v), []);
  const closeLang = useCallback(() => setLangOpen(false), []);

  return {
    mobileOpen,
    langOpen,
    toggleMobile,
    closeMobile,
    toggleLang,
    closeLang,
  };
}
