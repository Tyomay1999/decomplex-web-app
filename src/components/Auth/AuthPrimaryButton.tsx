type Props = {
  children: string;
  disabled?: boolean;
  type?: "button" | "submit";
};

export function AuthPrimaryButton({ children, disabled, type = "submit" }: Props) {
  return (
    <button
      type={type}
      className="btn-full"
      style={{ backgroundColor: "#3B82F6", color: "#FFFFFF" }}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
