type Props = {
  text: string;
  linkText: string;
  onClick: () => void;
};

export function AuthFooterLink({ text, linkText, onClick }: Props) {
  return (
    <div className="auth-footer text-secondary">
      {text}{" "}
      <button type="button" className="auth-link" onClick={onClick}>
        {linkText}
      </button>
    </div>
  );
}
