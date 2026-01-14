type Props = {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
};

export function RememberMe({ checked, onChange, label }: Props) {
  return (
    <label className="auth-remember text-secondary">
      <input
        className="auth-remember__checkbox"
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="auth-remember__label">{label}</span>
    </label>
  );
}
