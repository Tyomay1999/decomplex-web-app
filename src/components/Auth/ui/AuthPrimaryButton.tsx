type Props = {
  children: string;
  disabled?: boolean;
  type?: "button" | "submit";
};

export function AuthPrimaryButton({ children, disabled, type = "submit" }: Props) {
  return (
    <button type={type} className="btn-full btn-primary" disabled={disabled}>
      {children}
    </button>
  );
}
