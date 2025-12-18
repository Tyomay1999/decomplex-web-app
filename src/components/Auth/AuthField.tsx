type Props = {
  id: string;
  label: string;
  type?: "text" | "email" | "password";
  value: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  onChange: (value: string) => void;
};

export function AuthField({
  id,
  label,
  type = "text",
  value,
  placeholder,
  required,
  autoComplete,
  onChange,
}: Props) {
  return (
    <div className="form-group">
      <label className="form-label text-primary" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="form-input border-color text-primary"
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
