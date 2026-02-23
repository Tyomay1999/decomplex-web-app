"use client";

export function ToastCard({
  message,
  kind = "info",
}: {
  message: string;
  kind?: "error" | "success" | "info";
}) {
  return (
    <div
      data-testid="toast"
      data-kind={kind}
      className={`toast-card bg-surface border-color toast-${kind}`}
    >
      <div className="toast-text text-primary">{message}</div>
    </div>
  );
}
