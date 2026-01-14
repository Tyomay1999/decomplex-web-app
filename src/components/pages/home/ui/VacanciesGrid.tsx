"use client";

import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function VacanciesGrid({ children }: Props) {
  return <div className="vacancies-grid">{children}</div>;
}
