"use client";

type Props = {
  theme: "light" | "dark";
  onToggle: () => void;
};

export function ThemeToggle({ theme, onToggle }: Props) {
  return (
    <button
      className="theme-btn bg-hover"
      type="button"
      onClick={onToggle}
      aria-label="Toggle theme"
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}
