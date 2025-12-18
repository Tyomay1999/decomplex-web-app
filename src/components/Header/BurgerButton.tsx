"use client";

type Props = {
  isOpen: boolean;
  onToggle: () => void;
};

export function BurgerButton({ isOpen, onToggle }: Props) {
  return (
    <button
      className={`burger-btn ${isOpen ? "active" : ""}`}
      type="button"
      onClick={onToggle}
      aria-label="Menu"
      aria-expanded={isOpen}
      data-burger
    >
      <span className="burger-line" />
      <span className="burger-line" />
      <span className="burger-line" />
    </button>
  );
}
