"use client";

import { useEffect, useRef } from "react";

type Props = {
  disabled: boolean;
  onReach: () => void;
};

export function VacanciesSentinel({ disabled, onReach }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (disabled) return;

    const io = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first?.isIntersecting) return;
        onReach();
      },
      { root: null, rootMargin: "200px", threshold: 0.01 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [disabled, onReach]);

  return <div ref={ref} className="vacancies-sentinel" />;
}
