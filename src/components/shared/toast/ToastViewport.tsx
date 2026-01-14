"use client";

import type { ReactNode } from "react";

export function ToastViewport({ children }: { children: ReactNode }) {
  return (
    <div className="toast-host" role="status" aria-live="polite" aria-relevant="additions removals">
      {children}
    </div>
  );
}
