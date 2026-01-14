"use client";

import type { ReactNode } from "react";

type Props = { children: ReactNode };

export function VacancyDetailsShell({ children }: Props) {
  return <div className="modal modal--wide bg-surface">{children}</div>;
}
