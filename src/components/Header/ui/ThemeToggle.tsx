"use client";

import type { UiTheme } from "../types";

type Props = {
  theme: UiTheme;
  onToggle: () => void;
  label: string;
};

export function ThemeToggle({ theme, onToggle, label }: Props) {
  const icon = theme === "light" ? "🌙" : "☀️";

  return (
    <button
      className="theme-btn bg-hover"
      type="button"
      onClick={onToggle}
      aria-label={label}
      data-theme-toggle
    >
      <span className="text-primary">{icon}</span>
    </button>
  );
}
