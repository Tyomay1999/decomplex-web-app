"use client";

type Option = { value: string; label: string };

type Props = {
  q: string;
  onQ: (v: string) => void;

  location: string;
  onLocation: (v: string) => void;

  jobType: string;
  onJobType: (v: string) => void;

  locations: Option[];
  jobTypes: Option[];

  labels: {
    searchPlaceholder: string;
    location: string;
    jobType: string;
    all: string;
    reset: string;
  };

  onReset: () => void;
};

export function ApplicationsFilters({
  q,
  onQ,
  location,
  onLocation,
  jobType,
  onJobType,
  locations,
  jobTypes,
  labels,
  onReset,
}: Props) {
  return (
    <div className="apps-filters">
      <input
        value={q}
        onChange={(e) => onQ(e.target.value)}
        placeholder={labels.searchPlaceholder}
        className="apps-filters__search bg-surface border-color text-primary"
      />

      <div className="apps-filters__row">
        <select
          value={location}
          onChange={(e) => onLocation(e.target.value)}
          className="apps-filters__select bg-surface border-color text-primary"
          aria-label={labels.location}
        >
          <option value="">{labels.all}</option>
          {locations.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <select
          value={jobType}
          onChange={(e) => onJobType(e.target.value)}
          className="apps-filters__select bg-surface border-color text-primary"
          aria-label={labels.jobType}
        >
          <option value="">{labels.all}</option>
          {jobTypes.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <button type="button" className="btn-secondary" onClick={onReset}>
          {labels.reset}
        </button>
      </div>
    </div>
  );
}
