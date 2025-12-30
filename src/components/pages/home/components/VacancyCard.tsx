type UiVacancy = {
  id: string;
  title: string;
  companyId: string;
  location: string;
  postedLabel: string;
};

type Props = {
  vacancy: UiVacancy;
  onClick: () => void;
};

export function VacancyCard({ vacancy, onClick }: Props) {
  return (
    <div
      className="vacancy-card bg-surface border-color"
      role="button"
      tabIndex={0}
      onClick={onClick}
    >
      <h3 className="vacancy-title text-primary">{vacancy.title}</h3>

      <p className="vacancy-company text-secondary">{vacancy.companyId}</p>

      <p className="vacancy-location text-secondary">📍 {vacancy.location}</p>

      <div className="vacancy-meta border-color text-tertiary">{vacancy.postedLabel}</div>
    </div>
  );
}
