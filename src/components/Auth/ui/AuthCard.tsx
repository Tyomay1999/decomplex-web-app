import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function AuthCard({ title, subtitle, children }: Props) {
  return (
    <div className="auth-container">
      <div className="auth-card bg-surface border-color">
        <h1 className="auth-title text-primary">{title}</h1>
        {subtitle ? <p className="auth-subtitle text-secondary">{subtitle}</p> : null}
        {children}
      </div>
    </div>
  );
}
