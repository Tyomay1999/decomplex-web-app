type Props = {
  status: string;
  statusLabels: Record<string, string>;
};

export function StatusPill({ status, statusLabels }: Props) {
  const label = statusLabels[status] ?? statusLabels.unknown ?? status;
  return <span className={`application-status status-${status}`}>{label}</span>;
}
