"use client";

type Props = {
  isOpen: boolean;
  onToggle: () => void;
  label: string;
};

export function BurgerButton({ isOpen, onToggle, label }: Props) {
  return (
    <button
      className={`burger-btn ${isOpen ? "active" : ""}`}
      type="button"
      onClick={onToggle}
      aria-label={label}
      aria-expanded={isOpen}
      data-burger
    >
      <span className="burger-line" />
      <span className="burger-line" />
      <span className="burger-line" />
    </button>
  );
}
