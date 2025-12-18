type AccountType = "candidate" | "company";

type Props = {
  label: string;
  value: AccountType;
  onChange: (v: AccountType) => void;
  candidateText: string;
  companyText: string;
};

export function AccountTypeToggle({ label, value, onChange, candidateText, companyText }: Props) {
  return (
    <div className="form-group">
      <label className="form-label text-primary">{label}</label>

      <div className="account-type-toggle">
        <button
          type="button"
          className={`toggle-btn border-color text-primary ${value === "candidate" ? "active" : ""}`}
          onClick={() => onChange("candidate")}
        >
          {candidateText}
        </button>

        <button
          type="button"
          className={`toggle-btn border-color text-primary ${value === "company" ? "active" : ""}`}
          onClick={() => onChange("company")}
        >
          {companyText}
        </button>
      </div>
    </div>
  );
}
