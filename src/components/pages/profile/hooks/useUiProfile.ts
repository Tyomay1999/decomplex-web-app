import { useMemo } from "react";
import type { UiProfile } from "../types";

type UserLike = Record<string, unknown>;

function isRecord(v: unknown): v is UserLike {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function getStr(obj: unknown, key: string): string | null {
  if (!isRecord(obj)) return null;
  const v = obj[key];
  if (typeof v !== "string") return null;

  const t = v.trim();
  return t ? t : null;
}

export function useUiProfile(primary: unknown, fallback: unknown, fallbackName: string): UiProfile {
  return useMemo(() => {
    const firstName = getStr(primary, "firstName") ?? getStr(fallback, "firstName");
    const lastName = getStr(primary, "lastName") ?? getStr(fallback, "lastName");
    const singleName = getStr(primary, "name") ?? getStr(fallback, "name");

    const fullName = `${firstName ?? ""} ${lastName ?? ""}`.trim() || singleName || fallbackName;

    const email = getStr(primary, "email") ?? getStr(fallback, "email") ?? "";

    const userTypeRaw = getStr(primary, "userType") ?? getStr(fallback, "userType");
    const userType: UiProfile["userType"] = userTypeRaw === "company" ? "company" : "candidate";

    const memberSinceIso =
      getStr(primary, "createdAt") ??
      getStr(fallback, "createdAt") ??
      getStr(primary, "registeredAt") ??
      getStr(fallback, "registeredAt") ??
      null;

    return { fullName, email, userType, memberSinceIso };
  }, [primary, fallback, fallbackName]);
}
