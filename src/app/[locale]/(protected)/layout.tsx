"use client";

import { useCurrentQuery } from "../../../features/auth/authApi";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data, isLoading, isError } = useCurrentQuery();

  useEffect(() => {
    if (!isLoading && (isError || !data?.user)) {
      router.replace("/en/login");
    }
  }, [isLoading, isError, data, router]);

  if (isLoading) return null;

  return <>{children}</>;
}
