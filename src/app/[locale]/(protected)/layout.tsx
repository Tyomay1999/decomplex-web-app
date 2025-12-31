"use client";

import { useEffect, ReactNode } from "react";
import { useRouter, useParams } from "next/navigation";
import { useCurrentQuery } from "../../../features/auth/authApi";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? "en";

  const { data, isLoading, isError } = useCurrentQuery();

  useEffect(() => {
    if (!isLoading && (isError || !data?.user)) {
      router.replace(`/${locale}/login`);
    }
  }, [isLoading, isError, data?.user, router, locale]);

  if (isLoading) return null;

  return <>{children}</>;
}
